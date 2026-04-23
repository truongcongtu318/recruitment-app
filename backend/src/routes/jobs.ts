import { Router } from 'express';
import { jobsController } from '../controllers/jobs.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', jobsController.getJobs.bind(jobsController));
router.get('/:id', jobsController.getJob.bind(jobsController));

// Admin only routes
router.post('/', authenticateToken, isAdmin, jobsController.createJob.bind(jobsController));
router.put('/:id', authenticateToken, isAdmin, jobsController.updateJob.bind(jobsController));
router.delete('/:id', authenticateToken, isAdmin, jobsController.deleteJob.bind(jobsController));

export default router;
