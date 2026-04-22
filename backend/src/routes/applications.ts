import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';
import { ApplicationWithJob } from '../types/index.js';

const router = Router();

/**
 * GET /admin/applications
 * Demonstrates SQL JOIN for Week 3.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        a.id, 
        a.full_name, 
        a.email, 
        a.submitted_at, 
        a.status,
        j.title as job_title,
        j.company as job_company
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      ORDER BY a.submitted_at DESC
    `;
    
    const { rows } = await pool.query<ApplicationWithJob>(query);
    res.json(rows);
  } catch (err: any) {
    console.error('Error fetching admin applications:', err.message);
    res.status(500).json({ error: 'Database query failed' });
  }
});

export default router;
