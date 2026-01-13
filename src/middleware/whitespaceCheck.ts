import { Request, Response, NextFunction } from 'express';
import { UnprocessableEntityError, ValidationError } from '../utils/AppError.js';

/**
 * Middleware to check for whitespace-only fields before Zod validation
 * This runs BEFORE validation middleware to catch whitespace-only strings
 * that would otherwise be trimmed by Zod
 */

export const checkWhitespaceKollab = (req: Request, res: Response, next: NextFunction) => {
    const { goal, successCriteria, participants } = req.body;

    if (typeof goal === 'string' && goal.trim() === '') {
        throw new UnprocessableEntityError('Goal cannot be whitespace only');
    }

    if (typeof successCriteria === 'string' && successCriteria.trim() === '') {
        throw new UnprocessableEntityError('Success criteria cannot be whitespace only');
    }

    if (Array.isArray(participants)) {
        const hasWhitespaceParticipant = participants.some(
            (p: any) => typeof p === 'string' && p.trim() === ''
        );
        if (hasWhitespaceParticipant) {
            throw new UnprocessableEntityError('Participant names cannot be whitespace only');
        }
    }

    next();
};

export const checkWhitespaceDiscussion = (req: Request, res: Response, next: NextFunction) => {
    const { message, author } = req.body;

    // Only catch whitespace-only strings (strings with length > 0 that become empty after trim)
    // Empty strings ('') should be caught by Zod validation (400)
    if (typeof message === 'string' && message.length > 0 && message.trim() === '') {
        throw new UnprocessableEntityError('Message cannot be whitespace only');
    }

    if (typeof author === 'string' && author.length > 0 && author.trim() === '') {
        throw new UnprocessableEntityError('Author cannot be whitespace only');
    }

    next();
};
