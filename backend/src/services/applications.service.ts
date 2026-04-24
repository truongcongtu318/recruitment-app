import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { pool } from '../config/db.js';

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-west-2' });

export class ApplicationsService {
  async getAllApplications() {
    const query = `
      SELECT a.*, j.title as job_title, j.company as job_company
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      ORDER BY a.submitted_at DESC
    `;
    
    console.log(`[DB Query - JOIN] Executing: ${query}`);

    // Proving Index usage in JOIN
    try {
      const explainResult = await pool.query(`EXPLAIN ${query}`);
      explainResult.rows.forEach(row => {
        console.log(`[DB Index Proof - JOIN] ${row['QUERY PLAN']}`);
      });
    } catch (e) {
      console.error('[DB Index Proof] Error running EXPLAIN:', e);
    }

    const { rows } = await pool.query(query);
    console.log(`[DB Result] Found ${rows.length} applications.`);

    // Generate signed URLs for CVs
    return Promise.all(rows.map(async (row) => {
      if (row.cv_s3_key && process.env.S3_BUCKET) {
        try {
          const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: row.cv_s3_key,
          });
          const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
          return { ...row, cv_url: signedUrl };
        } catch (s3Err) {
          console.error(`[S3] Error signing URL for ${row.cv_s3_key}:`, s3Err);
          return { ...row, cv_url: null };
        }
      }
      return { ...row, cv_url: null };
    }));
  }

  async getApplicationsByJobId(jobId: number) {
    const query = `
      SELECT a.*, j.title as job_title, j.company as job_company
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.job_id = $1
      ORDER BY a.submitted_at DESC
    `;
    
    console.log(`[DB Query - JOIN] Executing: ${query} | JobID: ${jobId}`);

    // Proving Index usage in JOIN by JobID
    try {
      const explainResult = await pool.query(`EXPLAIN ${query}`, [jobId]);
      explainResult.rows.forEach(row => {
        console.log(`[DB Index Proof - JOIN] ${row['QUERY PLAN']}`);
      });
    } catch (e) {
      console.error('[DB Index Proof] Error running EXPLAIN:', e);
    }

    const { rows } = await pool.query(query, [jobId]);
    console.log(`[DB Result] Found ${rows.length} applications for job ${jobId}.`);

    return Promise.all(rows.map(async (row) => {
      if (row.cv_s3_key && process.env.S3_BUCKET) {
        try {
          const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: row.cv_s3_key,
          });
          const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
          return { ...row, cv_url: signedUrl };
        } catch (s3Err) {
          console.error(`[S3] Error signing URL for ${row.cv_s3_key}:`, s3Err);
          return { ...row, cv_url: null };
        }
      }
      return { ...row, cv_url: null };
    }));
  }

  async updateStatus(id: string, status: string) {
    const result = await pool.query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
}

export const applicationsService = new ApplicationsService();
