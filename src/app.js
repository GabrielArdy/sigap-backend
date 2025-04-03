import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connect } from './config/mongodb.js';

// Import routes
import authRoutes from './routes/auth_routes.js';
import attendanceRoutes from './routes/attendance_routes.js';
import stationRoutes from './routes/station_routes.js';
import QRRoutes from './routes/qr_routes.js';
import userRoutes from './routes/user_routes.js';
import adminRoutes from './routes/admin_routes.js';
import reportRoutes from './routes/report_routes.js';
import leaveRequestRoutes from './routes/leave_routes.js';

// Load environment variables
dotenv.config();

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
  };

// Initialize Express app
const app = express();

// Set middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(morgan('dev'));
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
app.use('/api/qr', QRRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/leaves', leaveRequestRoutes);


// Error handling middleware
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((err, req, res) => {
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