import mongoose, { Document, Schema } from 'mongoose';

export interface IJobApplication extends Document {
  user: mongoose.Types.ObjectId;
  companyName: string;
  roleTitle: string;
  status: 'To Apply' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected' | 'Withdrawn';
  applicationDate: Date;
  submissionDeadline?: Date;
  isDreamCompany: boolean;
  jobPostUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'Company name cannot be empty'],
    maxlength: [200, 'Company name is too long']
  },
  roleTitle: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'Role title cannot be empty'],
    maxlength: [200, 'Role title is too long']
  },
  status: {
    type: String,
    enum: ['To Apply', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'],
    default: 'To Apply',
    required: true,
    index: true
  },
  applicationDate: {
    type: Date,
    required: true,
    default: Date.now,
    validate: {
      validator: function(value: Date) {
        return !isNaN(value.getTime());
      },
      message: 'Invalid application date'
    },
    index: true
  },
  submissionDeadline: {
    type: Date,
    required: false,
    validate: {
      validator: function(value: Date) {
        return value ? !isNaN(value.getTime()) : true;
      },
      message: 'Invalid submission deadline'
    },
    index: true
  },
  isDreamCompany: {
    type: Boolean,
    default: false,
    required: true,
    index: true
  },
  jobPostUrl: {
    type: String,
    trim: true,
    required: false,
    validate: {
      validator: function(value: string) {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch (error) {
          return false;
        }
      },
      message: 'Invalid URL format'
    }
  },
  notes: {
    type: String,
    trim: true,
    required: false,
    maxlength: [2000, 'Notes are too long']
  }
}, {
  timestamps: true
});

// Pre-save middleware to validate and convert dates
jobApplicationSchema.pre('save', function(next) {
  // Convert string dates to Date objects if needed
  if (typeof this.applicationDate === 'string') {
    const date = new Date(this.applicationDate);
    if (isNaN(date.getTime())) {
      next(new Error('Invalid application date'));
    }
    this.applicationDate = date;
  }

  if (this.submissionDeadline && typeof this.submissionDeadline === 'string') {
    const date = new Date(this.submissionDeadline);
    if (isNaN(date.getTime())) {
      next(new Error('Invalid submission deadline'));
    }
    this.submissionDeadline = date;
  }

  next();
});

// Create compound indexes for common queries
jobApplicationSchema.index({ user: 1, status: 1 });
jobApplicationSchema.index({ user: 1, applicationDate: -1 });
jobApplicationSchema.index({ user: 1, isDreamCompany: 1 });

export const JobApplication = mongoose.model<IJobApplication>('JobApplication', jobApplicationSchema); 