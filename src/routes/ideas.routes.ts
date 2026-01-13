import { Router } from 'express';
import * as ideaController from '../controllers/ideas.controller.js';
import { validate } from '../middleware/validation.js';
import { createIdeaSchema, getIdeasSchema, ideaIdSchema } from '../validators/idea.validator.js';

const router = Router();

router.post('/', validate(createIdeaSchema), ideaController.createIdea);
router.get('/', validate(getIdeasSchema), ideaController.getIdeas);
router.get('/:id', validate(ideaIdSchema), ideaController.getIdeaById);

export default router;
