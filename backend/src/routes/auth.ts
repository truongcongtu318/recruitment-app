import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../config/db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Validation Schemas
const registerSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role: z.enum(['candidate', 'employer', 'admin']).default('candidate'),
});

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

/**
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, role } = registerSchema.parse(req.body);
    console.log(`[Auth] Thử đăng ký tài khoản mới: ${email} với vai trò: ${role}`);

    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rowCount && userCheck.rowCount > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: [{ path: ['email'], message: 'Email này đã được sử dụng' }] 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role',
      [fullName, email, hashedPassword, role]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ 
      user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role }, 
      token 
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.issues });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    console.log(`[Auth] Thử đăng nhập: ${email}`);

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ 
        error: 'Validation failed', 
        details: [{ path: ['email'], message: 'Email hoặc mật khẩu không chính xác' }] 
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
      token
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.issues });
    }
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const result = await pool.query('SELECT id, full_name, email, role FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, fullName: user.full_name, email: user.email, role: user.role });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
