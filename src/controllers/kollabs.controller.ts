import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Kollab } from '../models/Kollab.js';
import { Idea } from '../models/Idea.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError, ForbiddenError, ConflictError, UnprocessableEntityError, ValidationError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';

export const createKollab = asyncHandler(async (req: Request, res: Response) => {
  const { ideaId, goal, participants, successCriteria } = req.body;

  const idea = await Idea.findById(ideaId);

  if (!idea) {
    throw new NotFoundError(`Idea not found: ${ideaId}`);
  }

  if (idea.status !== 'approved') {
    logger.warn(
      `Unauthorized attempt to create Kollab for idea ${ideaId} with status ${idea.status}`,
    );
    const error = new ForbiddenError('Cannot create Kollab from non-approved idea');
    (error as any).data = { currentStatus: idea.status, requiredStatus: 'approved' };
    throw error;
  }

  const existingKollab = await Kollab.findOne({ ideaId, status: 'active' });

  if (existingKollab) {
    const error = new ConflictError('Duplicate active Kollab not allowed');
    (error as any).error = 'active Kollab already exists';
    throw error;
  }

  try {
    const kollab = await Kollab.create({ ideaId, goal, participants, successCriteria });
    return sendSuccess(res, kollab, 'Kollab created successfully', 201);
  } catch (error: any) {
    // Handle MongoDB duplicate key error (race condition in concurrent requests)
    if (error.code === 11000 && error.message.includes('ideaId_1_status_1')) {
      const conflictError = new ConflictError('Duplicate active Kollab not allowed');
      (conflictError as any).error = 'active Kollab already exists';
      throw conflictError;
    }
    throw error;
  }
});

export const getKollabById = asyncHandler(async (req: Request, res: Response) => {
  const kollab = await Kollab.findById(req.params.id)
    .populate('ideaId', 'title description status')
    .lean();

  if (!kollab) {
    throw new NotFoundError('Kollab not found');
  }

  return sendSuccess(res, kollab);
});

export const addDiscussion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { message, author, parentId } = req.body;

  const kollab = await Kollab.findById(id);

  if (!kollab) {
    throw new NotFoundError('Kollab not found');
  }

  if (kollab.status !== 'active') {
    const error = new ConflictError('Cannot add discussion to non-active Kollab');
    (error as any).data = { currentStatus: kollab.status, requiredStatus: 'active' };
    throw error;
  }

  if (kollab.discussions.length >= 1000) {
    throw new UnprocessableEntityError('Maximum discussion limit reached (1000)');
  }

  if (parentId) {
    const parentExists = kollab.discussions.some(d => d._id && d._id.toString() === parentId);
    if (!parentExists) {
      throw new NotFoundError('Parent discussion not found');
    }
  }

  try {
    kollab.discussions.push({
      message,
      author,
      parentId: parentId || null,
      createdAt: new Date(),
    } as any);

    await kollab.save();

    const newDiscussion = kollab.discussions[kollab.discussions.length - 1];
    return sendSuccess(res, newDiscussion, 'Discussion added successfully', 201);
  } catch (error: any) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ');
      throw new ValidationError(messages);
    }
    throw error;
  }
});
