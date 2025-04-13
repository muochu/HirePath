import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

export const register = async (req: Request, res: Response) => {
  try {
    console.log('Registration request received:', req.body);
    
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

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      // Create new user
      user = new User({
        email,
        password, // Will be hashed by the pre-save hook
        name,
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

      await user.save();
      console.log('User created successfully:', user._id);

      // Create JWT token
      const token = jwt.sign(
        { userId: user._id },
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
      console.error('Error saving user:', saveError);
      return res.status(500).json({ 
        message: 'Error creating user',
        error: saveError.message 
      });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
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
      { userId: user._id },
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
    const user = await User.findById(req.user._id).select('stats kpiSettings');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate progress towards daily goal
    const progress = {
      daily: {
        current: user.stats.applicationsToday,
        target: user.kpiSettings.dailyTarget,
        percentage: Math.min(100, (user.stats.applicationsToday / user.kpiSettings.dailyTarget) * 100),
      },
      weekly: {
        current: user.stats.applicationsThisWeek,
        target: user.kpiSettings.dailyTarget * 7,
        percentage: Math.min(100, (user.stats.applicationsThisWeek / (user.kpiSettings.dailyTarget * 7)) * 100),
      },
      monthly: {
        current: user.stats.applicationsThisMonth,
        target: user.kpiSettings.dailyTarget * 30,
        percentage: Math.min(100, (user.stats.applicationsThisMonth / (user.kpiSettings.dailyTarget * 30)) * 100),
      },
    };

    res.json({
      stats: user.stats,
      kpiSettings: user.kpiSettings,
      progress,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 