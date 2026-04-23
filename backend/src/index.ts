import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initDB } from './config/db.js';
import jobsRouter from './routes/jobs.js';
import applyRouter from './routes/apply.js';
import adminRouter from './routes/applications.js';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// Advanced Request Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Routes
app.use('/api/jobs', jobsRouter);
app.use('/api/apply', applyRouter);
app.use('/api/admin/applications', adminRouter);
app.use('/api/auth', authRouter);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'G12-Recruitment-Backend-TS',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error Handler]', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Bootstrap
async function bootstrap() {
  // 1. Start listening IMMEDIATELY so ALB health checks pass
  const server = app.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log('🚀 G12 RECRUITMENT BACKEND (TS) IS LIVE');
    console.log(`📡 Listening on port: ${PORT}`);
    console.log('-------------------------------------------');
  });

  try {
    // 2. Initialize DB and migrations in the background
    console.log('[DB] Connecting to database...');
    await initDB();
  } catch (err: any) {
    console.error('❌ DATABASE INITIALIZATION FAILURE:', err.message);
    // Note: We don't exit(1) here to allow the container to stay alive 
    // for debugging or potential automatic recovery/retry.
  }
}

bootstrap();
