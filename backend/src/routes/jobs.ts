import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';
import { Job } from '../types/index.js';

const router = Router();

/**
 * GET /jobs
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query<Job>(
      'SELECT id, title, description, location, type, company, salary, level, is_hot, deadline FROM jobs ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err: any) {
    console.error('GET /jobs error:', err.message);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

/**
 * GET /jobs/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query<Job>(
      'SELECT id, title, description, location, type, company, salary, level, is_hot, deadline FROM jobs WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Job not found' });
    res.json(rows[0]);
  } catch (err: any) {
    console.error('GET /jobs/:id error:', err.message);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

export default router;
