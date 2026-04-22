import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDB } from './config/db';
import jobsRouter from './routes/jobs';
import applyRouter from './routes/apply';
import adminRouter from './routes/applications';
const app = express();
const PORT = process.env.PORT || 8000;
// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
// Request Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Routes
app.use('/jobs', jobsRouter);
app.use('/apply', applyRouter);
app.use('/admin/applications', adminRouter);
// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'G12-Recruitment-Backend-TS',
        timestamp: new Date().toISOString()
    });
});
// Global Error Handler
app.use((err, req, res, next) => {
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
    }
    catch (err) {
        console.error('❌ CRITICAL STARTUP FAILURE:', err.message);
        process.exit(1);
    }
}
bootstrap();
