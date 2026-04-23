import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';

const registerSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role: z.enum(['candidate', 'admin']).default('candidate'),
});

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      
      return res.status(201).json({
        user: {
          id: result.user.id,
          fullName: result.user.full_name,
          email: result.user.email,
          role: result.user.role
        },
        token: result.token
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: err.issues });
      }
      if (err.message === 'EMAIL_EXISTS') {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: [{ path: ['email'], message: 'Email này đã được sử dụng' }] 
        });
      }
      console.error('[AuthController] Register error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      
      return res.json(result);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: err.issues });
      }
      if (err.message === 'INVALID_CREDENTIALS') {
        return res.status(401).json({ 
          error: 'Validation failed', 
          details: [{ path: ['email'], message: 'Email hoặc mật khẩu không chính xác' }] 
        });
      }
      console.error('[AuthController] Login error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await authService.getUserById(userId);
      
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      return res.json({
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      });
    } catch (err: any) {
      console.error('[AuthController] Me error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const authController = new AuthController();
