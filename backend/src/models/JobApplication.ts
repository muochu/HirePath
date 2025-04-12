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
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  roleTitle: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['To Apply', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'],
    default: 'To Apply',
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  submissionDeadline: {
    type: Date,
  },
  isDreamCompany: {
    type: Boolean,
    default: false,
  },
  jobPostUrl: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for faster queries
jobApplicationSchema.index({ user: 1, status: 1 });
jobApplicationSchema.index({ user: 1, applicationDate: -1 });
jobApplicationSchema.index({ user: 1, submissionDeadline: 1 });
jobApplicationSchema.index({ user: 1, isDreamCompany: 1 });

export const JobApplication = mongoose.model<IJobApplication>('JobApplication', jobApplicationSchema); 