import mongoose, { Schema, Document } from 'mongoose';
import { IIdea } from '../types/index.js';

export interface IdeaDocument extends IIdea, Document {}

const ideaSchema = new Schema<IdeaDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    createdBy: {
      type: String,
      required: [true, 'Created by is required'],
      trim: true,
      minlength: [2, 'Author name must be at least 2 characters'],
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'approved', 'archived'],
        message: '{VALUE} is not a valid status',
      },
      default: 'draft',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
ideaSchema.index({ status: 1 });
ideaSchema.index({ createdBy: 1 });
ideaSchema.index({ createdAt: -1 });

ideaSchema.virtual('activeKollab', {
  ref: 'Kollab',
  localField: '_id',
  foreignField: 'ideaId',
  justOne: true,
  match: { status: 'active' },
});

// Since we want `hasActiveKollab` specifically as a boolean
ideaSchema.virtual('hasActiveKollab').get(function (this: IdeaDocument) {
  // This requires `activeKollab` to be populated
  return !!(this as unknown as { activeKollab: unknown }).activeKollab;
});

export const Idea = mongoose.model<IdeaDocument>('Idea', ideaSchema);
