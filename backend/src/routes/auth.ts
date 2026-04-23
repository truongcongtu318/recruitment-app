import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * Public routes
 */
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

/**
 * Protected routes
 */
router.get('/me', authenticateToken, authController.me.bind(authController));

export default router;
