import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import groupRoutes from './routes/groupRoutes.js';

const app = express();

// ───── Trust Render/proxy headers (required for express-rate-limit on Render/Heroku) ─────
app.set('trust proxy', 1);

app.use(helmet());

// ───── CORS ─────
// In production: allow FRONTEND_URL env var + localhost for dev
// Note: cors() with no args allows ALL origins — fine for a public API.
// We restrict only if FRONTEND_URL is explicitly set.
const corsOptions = process.env.FRONTEND_URL
  ? {
      origin: [
        process.env.FRONTEND_URL,
        // also allow the www variant
        process.env.FRONTEND_URL.replace('https://', 'https://www.'),
        'http://localhost:5173',
        'http://localhost:3000',
      ].filter(Boolean),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }
  : {}; // No FRONTEND_URL set → allow all origins (open CORS for dev/testing)

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // pre-flight for all routes

// ───── Rate Limiting ─────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ───── Basic Middlewares ─────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ───── Data Sanitization ─────
app.use(mongoSanitize());
app.use(xss());

// ───── Health Check — Render uses this to monitor uptime ─────
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  if (dbState === 1) {
    return res.status(200).json({ status: 'ok', db: 'connected', uptime: process.uptime() });
  }
  return res.status(503).json({ status: 'error', db: 'disconnected' });
});

// Root ping
app.get('/', (req, res) => {
  res.json({ message: 'Finance Tracker API is running 🚀', health: '/health' });
});

// ───── API Routes ─────
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/groups', groupRoutes);

// ───── 404 Handler ─────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ───── Global Error Handler ─────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ───── Database Connection ─────
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000, // 15s to connect to Atlas
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
};

export default app;