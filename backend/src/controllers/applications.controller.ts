import { Request, Response } from 'express';
import { applicationsService } from '../services/applications.service.js';

export class ApplicationsController {
  async getApplications(req: Request, res: Response) {
    try {
      const applications = await applicationsService.getAllApplications();
      return res.json(applications);
    } catch (err: any) {
      console.error('[ApplicationsController] getApplications error:', err.message);
      return res.status(500).json({ error: 'Database query failed' });
    }
  }

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    
    const allowedStatus = ['Pending', 'Interviewing', 'Accepted', 'Rejected'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    try {
      const updated = await applicationsService.updateStatus(id, status);
      if (!updated) return res.status(404).json({ error: 'Application not found' });
      return res.json(updated);
    } catch (err: any) {
      console.error('[ApplicationsController] updateStatus error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }
  }
}

export const applicationsController = new ApplicationsController();
