import { Router } from 'express';
import ideaRoutes from './ideas.routes.js';
import kollabRoutes from './kollabs.routes.js';

const router = Router();

router.use('/ideas', ideaRoutes);
router.use('/kollabs', kollabRoutes);

export default router;
