import { Request, Response } from 'express';
import { JobApplication } from '../models/JobApplication';
import { User } from '../models/User';
import { validationResult } from 'express-validator';

// Helper function to update user stats
const updateUserStats = async (userId: string, isNewApplication: boolean = false) => {
  const user = await User.findById(userId);
  if (!user) return;

  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get start of week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  // Get start of month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Count applications for different time periods
  const todayCount = await JobApplication.countDocuments({
    user: userId,
    applicationDate: { $gte: today }
  });
  
  const weekCount = await JobApplication.countDocuments({
    user: userId,
    applicationDate: { $gte: startOfWeek }
  });
  
  const monthCount = await JobApplication.countDocuments({
    user: userId,
    applicationDate: { $gte: startOfMonth }
  });
  
  const totalCount = await JobApplication.countDocuments({ user: userId });
  
  // Update user stats
  user.stats.applicationsToday = todayCount;
  user.stats.applicationsThisWeek = weekCount;
  user.stats.applicationsThisMonth = monthCount;
  user.stats.totalApplications = totalCount;
  
  // Update last application date if this is a new application
  if (isNewApplication) {
    user.stats.lastApplicationDate = new Date();
  }
  
  await user.save();
};

// Create a new job application
export const createJobApplication = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const jobApplication = new JobApplication({
      ...req.body,
      user: req.user._id,
    });

    await jobApplication.save();
    
    // Update user stats
    await updateUserStats(req.user._id, true);
    
    res.status(201).json(jobApplication);
  } catch (error) {
    console.error('Create job application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all job applications for the current user
export const getJobApplications = async (req: Request, res: Response) => {
  try {
    const { 
      status, 
      sort = '-applicationDate',
      isDreamCompany,
      submissionDeadline,
      companyName
    } = req.query;
    
    const query: any = { user: req.user._id };
    
    // Apply filters
    if (status) {
      query.status = status;
    }
    
    if (isDreamCompany !== undefined) {
      query.isDreamCompany = isDreamCompany === 'true';
    }
    
    if (submissionDeadline) {
      // If submissionDeadline is 'upcoming', get applications with deadlines in the next 7 days
      if (submissionDeadline === 'upcoming') {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        query.submissionDeadline = {
          $gte: today,
          $lte: nextWeek
        };
      } else if (submissionDeadline === 'past') {
        // If submissionDeadline is 'past', get applications with deadlines in the past
        const today = new Date();
        query.submissionDeadline = { $lt: today };
      } else if (submissionDeadline === 'none') {
        // If submissionDeadline is 'none', get applications with no deadline
        query.submissionDeadline = { $exists: false };
      }
    }
    
    if (companyName) {
      query.companyName = { $regex: companyName, $options: 'i' };
    }

    const jobApplications = await JobApplication.find(query)
      .sort(sort as string)
      .exec();

    res.json(jobApplications);
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single job application
export const getJobApplication = async (req: Request, res: Response) => {
  try {
    const jobApplication = await JobApplication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!jobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    res.json(jobApplication);
  } catch (error) {
    console.error('Get job application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a job application
export const updateJobApplication = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const jobApplication = await JobApplication.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true }
    );

    if (!jobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    // Update user stats
    await updateUserStats(req.user._id);

    res.json(jobApplication);
  } catch (error) {
    console.error('Update job application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a job application
export const deleteJobApplication = async (req: Request, res: Response) => {
  try {
    const jobApplication = await JobApplication.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!jobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    // Update user stats
    await updateUserStats(req.user._id);

    res.json({ message: 'Job application deleted' });
  } catch (error) {
    console.error('Delete job application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 