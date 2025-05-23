import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  kpiSettings: {
    dailyTarget: number;
    level: 'Just Looking' | 'Really Want It' | 'Desperate';
    dreamCompanies: string[];
  };
  stats: {
    totalApplications: number;
    applicationsThisMonth: number;
    applicationsThisWeek: number;
    applicationsToday: number;
    lastApplicationDate: Date;
  };
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  kpiSettings: {
    dailyTarget: {
      type: Number,
      default: 10,
      min: 1,
    },
    level: {
      type: String,
      enum: ['Just Looking', 'Really Want It', 'Desperate'],
      default: 'Just Looking',
    },
    dreamCompanies: [{
      type: String,
      trim: true,
    }],
  },
  stats: {
    totalApplications: {
      type: Number,
      default: 0,
    },
    applicationsThisMonth: {
      type: Number,
      default: 0,
    },
    applicationsThisWeek: {
      type: Number,
      default: 0,
    },
    applicationsToday: {
      type: Number,
      default: 0,
    },
    lastApplicationDate: {
      type: Date,
      default: null,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  console.log('Pre-save hook triggered for user:', user.email);

  if (!user.isModified('password')) {
    console.log('Password not modified, skipping hash');
    return next();
  }
  
  try {
    console.log('Hashing password for user:', user.email);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    console.log('Password hashed successfully');
    next();
  } catch (error: any) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema); 