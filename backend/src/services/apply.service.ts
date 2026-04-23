import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { pool } from '../config/db.js';

const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-southeast-1' });

export class ApplyService {
  /**
   * Processes a new job application.
   */
  async submitApplication(data: {
    jobId: number;
    fullName: string;
    email: string;
    phone?: string;
    experienceSummary?: string;
    file: Express.Multer.File;
  }) {
    const { jobId, fullName, email, phone, experienceSummary, file } = data;

    // 1. Verify Job exists
    const jobCheck = await pool.query('SELECT id FROM jobs WHERE id = $1', [jobId]);
    if (jobCheck.rowCount === 0) {
      throw new Error('JOB_NOT_FOUND');
    }

    const cvKey = `cvs/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

    // 2. Upload to S3
    if (process.env.S3_BUCKET) {
      console.log(`[S3] Uploading to bucket: ${process.env.S3_BUCKET} | Key: ${cvKey}`);
      try {
        await s3.send(new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: cvKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        }));
      } catch (err: any) {
        console.error('[S3 Error]', err);
        throw new Error(`S3_UPLOAD_FAILED: ${err.message}`);
      }
    } else {
      console.warn('[S3] Skipping upload (S3_BUCKET not configured)');
    }

    // 3. Save to DB
    const query = `
      INSERT INTO applications (job_id, full_name, email, phone, experience_summary, cv_s3_key)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const { rows } = await pool.query(query, [
      jobId, fullName, email, phone || '', experienceSummary || '', cvKey
    ]);

    return { id: rows[0].id, cvKey };
  }
}

export const applyService = new ApplyService();
