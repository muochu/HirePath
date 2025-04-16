export type JobApplicationStatus = 
  | 'To Apply'
  | 'Applied'
  | 'Interviewing'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn';

// Base interface for job applications
interface BaseJobApplication {
  companyName: string;
  roleTitle: string;
  status: JobApplicationStatus;
  applicationDate: Date;
  submissionDeadline?: Date | null;
  isDreamCompany: boolean;
  jobPostUrl?: string;
  notes?: string;
}

// Interface for job applications from the server (includes required _id)
export interface JobApplication extends BaseJobApplication {
  _id: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for form data (excludes server-specific fields)
export interface JobApplicationFormData extends BaseJobApplication {
  // Add any frontend-specific form fields here if needed
}

export interface JobApplicationFilters {
  status?: JobApplicationStatus;
  isDreamCompany?: boolean;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

export interface JobApplicationStats {
  totalApplications: number;
  byStatus: Record<JobApplicationStatus, number>;
  dreamCompanies: number;
  activeApplications: number;
  responseRate: number;
} 