import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initDB } from './config/db.js';
import jobsRouter from './routes/jobs.js';
import applyRouter from './routes/apply.js';
import adminRouter from './routes/applications.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// Request Logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/jobs', jobsRouter);
app.use('/api/apply', applyRouter);
app.use('/api/admin/applications', adminRouter);

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
  try {
    await initDB();
    console.log('-------------------------------------------');
    console.log('🚀 G12 RECRUITMENT BACKEND (TS) IS LIVE');
    console.log(`📡 Listening on port: ${PORT}`);
    console.log('-------------------------------------------');
    
    app.listen(PORT, () => {
      // Server started
    });
  } catch (err: any) {
    console.error('❌ CRITICAL STARTUP FAILURE:', err.message);
    process.exit(1);
  }
}

bootstrap();
