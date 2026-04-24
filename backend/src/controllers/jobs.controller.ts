import { Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { jobsService } from '../services/jobs.service.js';

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

export class JobsController {
  async getJobs(req: Request, res: Response) {
    try {
      const { mine, level } = req.query;
      let userId: number | undefined;

      if (mine === 'true' && req.headers['authorization']) {
        try {
          const token = req.headers['authorization'].split(' ')[1];
          const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
          if (decoded.role === 'admin') {
            userId = decoded.id;
          }
        } catch (e) { /* ignore token error for public view */ }
      }

      const jobs = await jobsService.getAllJobs({ 
        mine: mine === 'true', 
        userId, 
        level: level as string 
      });
      return res.json(jobs);
    } catch (err: any) {
      console.error('[JobsController] getJobs error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  async getJob(req: Request, res: Response) {
    try {
      const job = await jobsService.getJobById(req.params.id);
      if (!job) {
        return res.status(404).json({ error: 'Công việc không tồn tại' });
      }
      return res.json(job);
    } catch (err: any) {
      return res.status(500).json({ error: 'Database error' });
    }
  }

  async createJob(req: Request, res: Response) {
    try {
      const data = jobSchema.parse(req.body);
      const userId = (req as any).user.id;
      const job = await jobsService.createJob(data, userId);
      return res.status(201).json(job);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
      return res.status(500).json({ error: 'Database error' });
    }
  }

  async updateJob(req: Request, res: Response) {
    try {
      const data = jobSchema.parse(req.body);
      const job = await jobsService.updateJob(req.params.id, data);
      if (!job) return res.status(404).json({ error: 'Job not found' });
      return res.json(job);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
      return res.status(500).json({ error: 'Database error' });
    }
  }

  async deleteJob(req: Request, res: Response) {
    try {
      const success = await jobsService.deleteJob(req.params.id);
      if (!success) return res.status(404).json({ error: 'Job not found' });
      return res.json({ message: 'Job deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Database error' });
    }
  }
}

export const jobsController = new JobsController();
