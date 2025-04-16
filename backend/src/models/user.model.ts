import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser {
  email: string;
  name: string;
  picture?: string;
  googleId?: string;
  password?: string;
  isGoogleUser: boolean;
  kpiSettings?: {
    dailyTarget: number;
    level: string;
    dreamCompanies: string[];
  };
  stats?: {
    totalApplications: number;
    applicationsThisMonth: number;
    applicationsThisWeek: number;
    applicationsToday: number;
    lastApplicationDate: Date | null;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  picture: { type: String },
  googleId: { type: String, sparse: true },
  password: { type: String },
  isGoogleUser: { type: Boolean, default: false },
  kpiSettings: {
    type: {
      dailyTarget: { type: Number, default: 10 },
      level: { type: String, default: 'Just Looking' },
      dreamCompanies: { type: [String], default: [] }
    },
    default: {
      dailyTarget: 10,
      level: 'Just Looking',
      dreamCompanies: []
    }
  },
  stats: {
    type: {
      totalApplications: { type: Number, default: 0 },
      applicationsThisMonth: { type: Number, default: 0 },
      applicationsThisWeek: { type: Number, default: 0 },
      applicationsToday: { type: Number, default: 0 },
      lastApplicationDate: { type: Date, default: null }
    },
    default: {
      totalApplications: 0,
      applicationsThisMonth: 0,
      applicationsThisWeek: 0,
      applicationsToday: 0,
      lastApplicationDate: null
    }
  }
}, {
  timestamps: true
});

// Validate that either googleId or password is present
userSchema.pre('save', function(next) {
  if (!this.isGoogleUser && !this.password) {
    next(new Error('Password is required for non-Google users'));
  } else if (this.isGoogleUser && !this.googleId) {
    next(new Error('Google ID is required for Google users'));
  } else {
    next();
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password || this.isGoogleUser) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (this.isGoogleUser || !this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default model<IUser>('User', userSchema); 