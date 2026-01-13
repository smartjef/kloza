import { Request, Response } from 'express';
import { Idea } from '../models/Idea.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError } from '../utils/AppError.js';
import { getPaginationMetadata } from '../utils/pagination.js';

export const createIdea = asyncHandler(async (req: Request, res: Response) => {
  const idea = await Idea.create(req.body);
  return sendSuccess(res, idea, 'Idea created successfully', 201);
});

export const getIdeas = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const sort: Record<string, 1 | -1> = {};
  sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  const [ideasDocs, totalItems] = await Promise.all([
    Idea.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('activeKollab'),
    Idea.countDocuments(filter),
  ]);

  // Convert to JSON to get plain objects with virtuals
  const ideas = ideasDocs.map(doc => doc.toJSON());

  const pagination = getPaginationMetadata(totalItems, Number(page), Number(limit));

  return sendSuccess(res, { ideas, pagination });
});

export const getIdeaById = asyncHandler(async (req: Request, res: Response) => {
  const ideaDoc = await Idea.findById(req.params.id).populate('activeKollab');

  if (!ideaDoc) {
    throw new NotFoundError('Idea not found');
  }

  // Convert to JSON to preserve virtuals
  const idea = ideaDoc.toJSON();

  return sendSuccess(res, idea);
});
