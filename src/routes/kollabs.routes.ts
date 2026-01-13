import { Router } from 'express';
import * as kollabController from '../controllers/kollabs.controller.js';
import { validate } from '../middleware/validation.js';
import { checkWhitespaceKollab, checkWhitespaceDiscussion } from '../middleware/whitespaceCheck.js';
import {
  createKollabSchema,
  updateKollabSchema,
  kollabIdSchema,
  addDiscussionSchema,
} from '../validators/kollab.validator.js';

const router = Router();

router.post('/', checkWhitespaceKollab, validate(createKollabSchema), kollabController.createKollab);
router.get('/:id', validate(kollabIdSchema), kollabController.getKollabById);
router.patch('/:id', checkWhitespaceKollab, validate(updateKollabSchema), kollabController.updateKollab);
router.delete('/:id', validate(kollabIdSchema), kollabController.deleteKollab);
router.post('/:id/discussions', checkWhitespaceDiscussion, validate(addDiscussionSchema), kollabController.addDiscussion);

export default router;

