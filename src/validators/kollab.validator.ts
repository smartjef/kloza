import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

export const createKollabSchema = z.object({
  body: z.object({
    ideaId: objectIdSchema,
    goal: z.string().trim().min(10).max(1000),
    participants: z.array(z.string().trim().min(2).max(100)).nonempty().max(50),
    successCriteria: z.string().trim().min(10).max(2000),
    status: z.enum(['active', 'completed', 'cancelled']).optional(),
  }),
});

export const addDiscussionSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    message: z.string().trim().min(1, 'Message cannot be empty').max(5000, 'Message cannot exceed 5000 characters'),
    author: z.string().trim().min(2, 'Author must be at least 2 characters').max(100, 'Author cannot exceed 100 characters'),
    parentId: z.union([
      z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid parentId format',
      }),
      z.undefined(),
    ]).optional(),
  }),
});

export const kollabIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
