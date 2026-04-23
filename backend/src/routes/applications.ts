import { Router } from 'express';
import { applicationsController } from '../controllers/applications.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * Admin Only routes
 */
router.get('/', authenticateToken, isAdmin, applicationsController.getApplications.bind(applicationsController));
router.put('/:id/status', authenticateToken, isAdmin, applicationsController.updateStatus.bind(applicationsController));

export default router;
