import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connect } from './config/mongodb.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth_routes.js';
import attendanceRoutes from './routes/attendance_routes.js';

// Load environment variables
dotenv.config();

// Get directory name (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();


// Set up morgan logging based on environment
const environment = process.env.NODE_ENV || 'development';
if (environment === 'production') {
  // Create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Create a write stream for logs
  const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
  );
  
  // Use combined format for production and write to log file
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  // Use dev format for non-production environments
  app.use(morgan('dev'));
}

// Set middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors('*'));
app.use(helmet());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sigap-db';
connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connection established');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to SIGAP API',
        timestamp: new Date()
    });
});

// API health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'SIGAP API is running',
    timestamp: new Date()
  });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/attendances', attendanceRoutes);

// Error handling middleware
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Start server
const PORT = process.env.PORT || 9000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

export default app;