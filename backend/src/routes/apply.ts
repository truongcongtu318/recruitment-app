import { Router } from 'express';
import multer from 'multer';
import { applyController } from '../controllers/apply.controller.js';

const router = Router();

// Multer config for CV uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF/Word are allowed.'));
    }
  },
});

/**
 * POST /api/apply
 * Handles new job applications with CV upload.
 */
router.post('/', (req, res, next) => {
  upload.single('cv')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: 'File upload error', details: err.message });
    } else if (err) {
      return res.status(400).json({ error: 'Invalid file', details: err.message });
    }
    next();
  });
}, applyController.handleApply.bind(applyController));

export default router;
