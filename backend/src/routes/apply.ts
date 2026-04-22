import { Router, Request, Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { z } from 'zod';
import { pool } from '../config/db.js';

const router = Router();

// Define a type for Request with Multer File
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Validation Schema
const applicationSchema = z.object({
  jobId: z.string().transform(Number),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  experienceSummary: z.string().optional(),
});

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only PDF/Word are allowed.'));
  },
});

const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-southeast-1' });

/**
 * POST /apply
 */
router.post('/', upload.single('cv'), async (req: Request, res: Response) => {
  const mReq = req as MulterRequest;

  try {
    // 1. Validate Input
    const validatedData = applicationSchema.parse(req.body);
    if (!mReq.file) return res.status(400).json({ error: 'CV file is required' });

    const { jobId, fullName, email, phone, experienceSummary } = validatedData;
    const cvKey = `cvs/${Date.now()}-${mReq.file.originalname.replace(/\s+/g, '_')}`;

    // 2. Upload to S3
    if (process.env.S3_BUCKET) {
      await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: cvKey,
        Body: mReq.file.buffer,
        ContentType: mReq.file.mimetype,
      }));
      console.log(`[S3] Uploaded: ${cvKey}`);
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

    res.status(201).json({
      success: true,
      message: 'Application submitted',
      id: rows[0].id
    });

  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.issues });
    }
    console.error('POST /apply error:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
