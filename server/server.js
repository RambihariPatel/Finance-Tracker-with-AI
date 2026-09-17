import app, { connectDB } from './app.js';
import dotenv from 'dotenv';
import { initCronJobs } from './services/cronService.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// ── Validate critical env vars at startup ──
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`\n❌ FATAL: Missing required environment variables: ${missing.join(', ')}`);
  console.error('Set these in your Render dashboard → Environment Variables.\n');
  process.exit(1);
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
    });
    // Only init cron jobs AFTER DB is connected and server is listening
    initCronJobs();
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
