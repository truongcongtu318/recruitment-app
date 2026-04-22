import { Router } from 'express';
import { pool } from '../config/db';
const router = Router();
/**
 * GET /admin/applications
 * Demonstrates SQL JOIN for Week 3.
 */
router.get('/', async (req, res) => {
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
        const { rows } = await pool.query(query);
        res.json(rows);
    }
    catch (err) {
        console.error('Error fetching admin applications:', err.message);
        res.status(500).json({ error: 'Database query failed' });
    }
});
export default router;
