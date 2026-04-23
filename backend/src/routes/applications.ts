import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/admin/applications
 * Admin Only: Fetch all job applications with job titles
 */
router.get('/', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT a.*, j.title as job_title, j.company as job_company
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      ORDER BY a.submitted_at DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err: any) {
    console.error('Error fetching admin applications:', err.message);
    res.status(500).json({ error: 'Database query failed' });
  }
});

/**
 * PUT /api/admin/applications/:id/status
 * Admin Only: Update application status
 */
router.put('/:id/status', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['Pending', 'Interviewing', 'Accepted', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Application not found' });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
