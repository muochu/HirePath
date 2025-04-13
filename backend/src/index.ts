import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import jobApplicationRoutes from './routes/jobApplicationRoutes';
import errorHandler from './middleware/errorHandler';
import { protect as auth } from './middleware/auth';
import AppError from './utils/AppError';

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
  'https://hirepath-frontend.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hirepath')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/applications', auth, jobApplicationRoutes);

// Handle unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(errorHandler);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HirePath API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 