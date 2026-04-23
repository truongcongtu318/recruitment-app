import { Request, Response } from 'express';
import { z } from 'zod';
import { applyService } from '../services/apply.service.js';

const applicationSchema = z.object({
  jobId: z.string().transform(Number),
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  experienceSummary: z.string().optional(),
});

export class ApplyController {
  async handleApply(req: Request, res: Response) {
    try {
      // 1. Validation
      const validatedData = applicationSchema.parse(req.body);

      if (!req.file) {
        return res.status(400).json({ error: 'CV file is required' });
      }

      // 2. Business Logic via Service
      const result = await applyService.submitApplication({
        ...validatedData,
        file: req.file
      });

      // 3. Response
      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        id: result.id
      });

    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: err.issues });
      }

      if (err.message === 'JOB_NOT_FOUND') {
        return res.status(404).json({ error: 'Công việc không tồn tại' });
      }

      console.error('[ApplyController Error]', err);
      return res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
}

export const applyController = new ApplyController();
