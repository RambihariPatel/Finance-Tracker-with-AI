import app, { connectDB } from './app.js';
import dotenv from 'dotenv';
import { initCronJobs } from './services/cronService.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    // Only init cron jobs AFTER DB is connected and server is listening
    initCronJobs();
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
