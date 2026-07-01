import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Route imports
import authRouter from './routes/auth.js';
import orgRouter from './routes/organization.js';
import employeeRouter from './routes/employees.js';
import recruitRouter from './routes/recruitment.js';
import attendRouter from './routes/attendance.js';
import leaveRouter from './routes/leaves.js';
import payrollRouter from './routes/payroll.js';
import projectRouter from './routes/projects.js';
import performRouter from './routes/performance.js';
import assetRouter from './routes/assets.js';
import ticketRouter from './routes/tickets.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes (to support local React dev server on different port)
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple log middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/organization', orgRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/recruitment', recruitRouter);
app.use('/api/attendance', attendRouter);
app.use('/api/leaves', leaveRouter);
app.use('/api/payroll', payrollRouter);
app.use('/api/projects', projectRouter);
app.use('/api/performance', performRouter);
app.use('/api/assets', assetRouter);
app.use('/api/tickets', ticketRouter);
app.use('/api/ai', aiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'Healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Workforce API Server running on port ${PORT}`);
  console.log(`📁 Database Path: ${path.join(__dirname, 'data', 'database.json')}`);
  console.log(`==================================================`);
});
