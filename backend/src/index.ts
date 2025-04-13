import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import jobApplicationRoutes from './routes/jobApplicationRoutes';
import errorHandler from './middleware/errorHandler';
import { protect as auth } from './middleware/auth';
import AppError from './utils/AppError';
import { NextFunction, Request, Response } from 'express';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use((req, res, next) => {
  console.log('Incoming request:', {
    origin: req.headers.origin,
    method: req.method,
    path: req.path
  });
  next();
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://hirepath.vercel.app',
  'https://hire-path-5fxz8qixq-muochus-projects.vercel.app',
  'chrome-extension://*'  // Allow Chrome extension requests
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests, or Chrome extensions)
    if (!origin) return callback(null, true);
    
    // Allow localhost, any Vercel subdomain, or Chrome extensions
    if (
      origin === 'http://localhost:3000' ||
      origin.endsWith('.vercel.app') ||
      origin.startsWith('chrome-extension://') ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }
    
    console.log('Blocked origin:', origin);
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Parse JSON bodies
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hirepath', {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  waitQueueTimeoutMS: 15000,
})
.then(() => {
  console.log('Connected to MongoDB');
  console.log('MongoDB URI:', process.env.MONGODB_URI?.replace(/:[^:@]*@/, ':****@')); // Hide password in logs
})
.catch((err) => {
  console.error('MongoDB connection error:', {
    message: err.message,
    code: err.code,
    name: err.name,
    stack: err.stack
  });
  process.exit(1); // Exit if we can't connect to the database
});

// Add MongoDB connection error handlers
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/applications', auth, jobApplicationRoutes);

// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(errorHandler);

// Add error logging middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  next(err);
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HirePath API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 