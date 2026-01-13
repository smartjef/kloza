import { Types } from 'mongoose';

export type IdeaStatus = 'draft' | 'approved' | 'archived';

export interface IIdea {
  title: string;
  description: string;
  createdBy: string;
  status: IdeaStatus;
  createdAt: Date;
  updatedAt: Date;
  hasActiveKollab?: boolean;
}

export type KollabStatus = 'active' | 'completed' | 'cancelled';

export interface IDiscussion {
  _id?: Types.ObjectId;
  message: string;
  author: string;
  parentId?: Types.ObjectId | null;
  createdAt: Date;
}

export interface IKollab {
  ideaId: Types.ObjectId;
  goal: string;
  participants: string[];
  successCriteria: string;
  status: KollabStatus;
  discussions: IDiscussion[];
  createdAt: Date;
  updatedAt: Date;
}
