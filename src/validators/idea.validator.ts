import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

export const createIdeaSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(200),
    description: z.string().trim().min(10).max(5000),
    createdBy: z.string().trim().min(2).max(100),
    status: z.enum(['draft', 'approved', 'archived']).optional(),
  }),
});

export const updateIdeaSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    title: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    createdBy: z.string().trim().min(2).max(100).optional(),
    status: z.enum(['draft', 'approved', 'archived']).optional(),
  }),
});

export const getIdeasSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).default('1').transform(Number),
    limit: z.string().regex(/^\d+$/).default('10').transform(Number),
    status: z.enum(['draft', 'approved', 'archived']).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'title']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const ideaIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

