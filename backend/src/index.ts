import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import userRoutes from './routes/userRoutes';
import jobApplicationRoutes from './routes/jobApplicationRoutes';

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
  'http://localhost:5000',
  'https://hirepath.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    console.log('Request origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin, allowing request');
      return callback(null, true);
    }
    
    // Allow all Vercel preview and production domains
    if (origin.includes('vercel.app') || origin.includes('localhost') || allowedOrigins.includes(origin)) {
      console.log('Origin allowed:', origin);
      return callback(null, true);
    }

    console.log('Origin rejected:', origin);
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hirepath';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/applications', jobApplicationRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HirePath API' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    details: err
  });
  
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 