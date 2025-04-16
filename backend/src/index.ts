import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import jobApplicationRoutes from './routes/jobApplicationRoutes';
import errorHandler from './middleware/errorHandler';
import { protect as auth } from './middleware/auth';
import { isPublicPath, serveStatic } from './middleware/static';
import AppError from './utils/AppError';
import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import authRoutes from './routes/auth.routes';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log('Incoming request:', {
    origin: req.headers.origin,
    method: req.method,
    path: req.path
  });
  next();
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Initialize Passport
app.use(passport.initialize());

// Serve static files and public paths BEFORE authentication
app.use(serveStatic);
app.use(isPublicPath);

// Routes that don't require authentication
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Protected routes
app.use('/api/applications', auth, jobApplicationRoutes);

// Handle unhandled routes
app.all('*', (req, res, next) => {
  // Check if it's a static file request
  if (req.path.match(/\.(json|ico|png|jpg|svg|js|css)$/)) {
    return next();
  }
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Log successful connection to frontend
console.log('Frontend URL configured as:', process.env.FRONTEND_URL); 