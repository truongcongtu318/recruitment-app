import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const jobSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().default('Remote'),
  type: z.string().default('Full-time'),
  company: z.string().min(1),
  salary: z.string().optional(),
  level: z.string().optional(),
  is_hot: z.boolean().default(false),
  deadline: z.string().optional(),
});

/**
 * GET /api/jobs
 * Public: Fetch all jobs
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * GET /api/jobs/:id
 * Public: Fetch a single job by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Công việc không tồn tại' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * POST /api/jobs
 * Admin Only: Create a new job
 */
router.post('/', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const data = jobSchema.parse(req.body);
    const result = await pool.query(
      `INSERT INTO jobs (title, description, location, type, company, salary, level, is_hot, deadline) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [data.title, data.description, data.location, data.type, data.company, data.salary, data.level, data.is_hot, data.deadline]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * PUT /api/jobs/:id
 * Admin Only: Update a job
 */
router.put('/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = jobSchema.parse(req.body);
    const result = await pool.query(
      `UPDATE jobs SET title=$1, description=$2, location=$3, type=$4, company=$5, salary=$6, level=$7, is_hot=$8, deadline=$9
       WHERE id=$10 RETURNING *`,
      [data.title, data.description, data.location, data.type, data.company, data.salary, data.level, data.is_hot, data.deadline, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Job not found' });
    res.json(result.rows[0]);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * DELETE /api/jobs/:id
 * Admin Only: Delete a job
 */
router.delete('/:id', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
