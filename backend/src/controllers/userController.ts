import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { JobApplication } from '../models/JobApplication';

export const register = async (req: Request, res: Response) => {
  try {
    console.log('Registration request received:', {
      ...req.body,
      password: '[REDACTED]'
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      console.log('Missing required fields:', { email: !!email, password: !!password, name: !!name });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. Current state:', mongoose.connection.readyState);
      return res.status(500).json({ message: 'Database connection error' });
    }

    try {
      // Check if user already exists
      console.log('Checking if user exists:', email);
      const existingUser = await User.findOne({ email }).maxTimeMS(5000);
      if (existingUser) {
        console.log('User already exists:', email);
        return res.status(400).json({ message: 'User already exists' });
      }

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set');
        return res.status(500).json({ message: 'Server configuration error: JWT_SECRET is not set' });
      }

      console.log('Creating new user...');
      // Create new user
      const user = new User({
        email,
        password,
        name,
        isGoogleUser: false,
        kpiSettings: {
          dailyTarget: 10,
          level: 'Just Looking',
          dreamCompanies: [],
        },
        stats: {
          totalApplications: 0,
          applicationsThisMonth: 0,
          applicationsThisWeek: 0,
          applicationsToday: 0,
          lastApplicationDate: null,
        },
      });

      console.log('Saving user...');
      await user.save();
      console.log('User created successfully:', user._id);

      // Create JWT token
      console.log('Creating JWT token...');
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          kpiSettings: user.kpiSettings,
          stats: user.stats,
        },
      });
    } catch (saveError: any) {
      console.error('Error saving user:', {
        error: saveError.message,
        code: saveError.code,
        name: saveError.name,
        stack: saveError.stack
      });
      
      // Check for validation errors
      if (saveError.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: Object.values(saveError.errors).map((err: any) => ({
            field: err.path,
            message: err.message
          }))
        });
      }
      
      return res.status(500).json({ 
        message: 'Error creating user',
        error: saveError.message,
        details: process.env.NODE_ENV === 'development' ? {
          code: saveError.code,
          name: saveError.name
        } : undefined
      });
    }
  } catch (error: any) {
    console.error('Registration error:', {
      error: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        name: error.name
      } : undefined
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is a Google user
    if (user.isGoogleUser) {
      return res.status(400).json({ 
        message: 'This account uses Google Sign-In. Please sign in with Google.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        kpiSettings: user.kpiSettings,
        stats: user.stats,
      },
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? 
        error instanceof Error ? error.message : 'Unknown error' 
        : undefined
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error: unknown) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? 
        error instanceof Error ? error.message : 'Unknown error' 
        : undefined
    });
  }
};

export const updateKPISettings = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { dailyTarget, level, dreamCompanies } = req.body;

    // Update user KPI settings
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only provided fields
    if (dailyTarget !== undefined) {
      user.kpiSettings.dailyTarget = dailyTarget;
    }

    if (level !== undefined) {
      user.kpiSettings.level = level;
    }

    if (dreamCompanies !== undefined) {
      user.kpiSettings.dreamCompanies = dreamCompanies;
    }

    await user.save();

    res.json({
      message: 'KPI settings updated successfully',
      kpiSettings: user.kpiSettings,
    });
  } catch (error: unknown) {
    console.error('Update KPI settings error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? 
        error instanceof Error ? error.message : 'Unknown error' 
        : undefined
    });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Get start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Count applications for different time periods
    const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
      JobApplication.countDocuments({
        user: user._id,
        applicationDate: { $gte: today }
      }),
      JobApplication.countDocuments({
        user: user._id,
        applicationDate: { $gte: startOfWeek }
      }),
      JobApplication.countDocuments({
        user: user._id,
        applicationDate: { $gte: startOfMonth }
      }),
      JobApplication.countDocuments({ user: user._id })
    ]);

    // Calculate progress percentages
    const dailyTarget = user.kpiSettings?.dailyTarget || 10;
    const weeklyTarget = dailyTarget * 7;
    const monthlyTarget = dailyTarget * 30;

    const stats = {
      stats: {
        totalApplications: totalCount,
        applicationsThisMonth: monthCount,
        applicationsThisWeek: weekCount,
        applicationsToday: todayCount,
        lastApplicationDate: user.stats?.lastApplicationDate
      },
      kpiSettings: user.kpiSettings || {
        dailyTarget: 10,
        level: 'Just Looking',
        dreamCompanies: []
      },
      progress: {
        daily: {
          current: todayCount,
          target: dailyTarget,
          percentage: Math.min((todayCount / dailyTarget) * 100, 100)
        },
        weekly: {
          current: weekCount,
          target: weeklyTarget,
          percentage: Math.min((weekCount / weeklyTarget) * 100, 100)
        },
        monthly: {
          current: monthCount,
          target: monthlyTarget,
          percentage: Math.min((monthCount / monthlyTarget) * 100, 100)
        }
      }
    };

    // Update user's stats in the database
    user.stats = {
      totalApplications: totalCount,
      applicationsThisMonth: monthCount,
      applicationsThisWeek: weekCount,
      applicationsToday: todayCount,
      lastApplicationDate: user.stats?.lastApplicationDate
    };
    await user.save();

    res.json(stats);
  } catch (error: unknown) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? 
        error instanceof Error ? error.message : 'Unknown error' 
        : undefined
    });
  }
}; 