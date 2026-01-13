import mongoose, { Schema, Document } from 'mongoose';
import { IKollab, IDiscussion } from '../types/index.js';

export interface KollabDocument extends IKollab, Document { }

const discussionSchema = new Schema<IDiscussion>(
  {
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    _id: true,
  },
);

const kollabSchema = new Schema<KollabDocument>(
  {
    ideaId: {
      type: Schema.Types.ObjectId,
      ref: 'Idea',
      required: true,
      index: true,
    },
    goal: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    participants: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 1 && v.length <= 50,
        message: 'Participants must be between 1 and 50',
      },
    },
    successCriteria: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
      required: true,
      index: true,
    },
    discussions: {
      type: [discussionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index: Only one active Kollab per Idea
kollabSchema.index(
  { ideaId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'active' },
  },
);

export const Kollab = mongoose.model<KollabDocument>('Kollab', kollabSchema);
export const Discussion = discussionSchema; // Export if needed elsewhere
