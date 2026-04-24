import { pool } from '../config/db.js';

export class JobsService {
  async getAllJobs(filters: { mine?: boolean; userId?: number; level?: string } = {}) {
    let query = `
      SELECT j.*, u.full_name as created_by_name 
      FROM jobs j 
      LEFT JOIN users u ON j.created_by = u.id
    `;
    const params: any[] = [];
    const whereClauses: string[] = [];

    if (filters.mine && filters.userId) {
      whereClauses.push(`j.created_by = $${params.length + 1}`);
      params.push(filters.userId);
    }

    if (filters.level) {
      whereClauses.push(`j.level = $${params.length + 1}`);
      params.push(filters.level);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY j.created_at DESC';

    console.log(`[DB Query] Executing: ${query} | Params: ${JSON.stringify(params)}`);

    // Proving Index usage directly in logs
    if (filters.level) {
      try {
        const explainResult = await pool.query(`EXPLAIN ${query}`, params);
        explainResult.rows.forEach(row => {
          console.log(`[DB Index Proof] ${row['QUERY PLAN']}`);
        });
      } catch (e) {
        console.error('[DB Index Proof] Error running EXPLAIN:', e);
      }
    }

    const result = await pool.query(query, params);
    console.log(`[DB Result] Returned ${result.rows.length} jobs.`);

    return result.rows;
  }

  async getJobById(id: string | number) {
    const query = 'SELECT * FROM jobs WHERE id = $1';
    console.log(`[DB Query] Executing: ${query} | ID: ${id}`);
    const result = await pool.query(query, [Number(id)]);
    return result.rows[0];
  }

  async createJob(data: any, userId: number) {
    const result = await pool.query(
      `INSERT INTO jobs (title, description, location, type, company, salary, level, is_hot, deadline, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        data.title, data.description, data.location, data.type,
        data.company, data.salary, data.level, data.is_hot,
        data.deadline, userId
      ]
    );
    return result.rows[0];
  }

  async updateJob(id: string | number, data: any) {
    const result = await pool.query(
      `UPDATE jobs SET title=$1, description=$2, location=$3, type=$4, company=$5, salary=$6, level=$7, is_hot=$8, deadline=$9
       WHERE id=$10 RETURNING *`,
      [
        data.title, data.description, data.location, data.type,
        data.company, data.salary, data.level, data.is_hot,
        data.deadline, Number(id)
      ]
    );
    return result.rows[0];
  }

  async deleteJob(id: string | number) {
    const result = await pool.query('DELETE FROM jobs WHERE id = $1', [Number(id)]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const jobsService = new JobsService();
