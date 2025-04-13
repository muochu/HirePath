import express from 'express';
import { body } from 'express-validator';
import { protect as auth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createJobApplication,
  getJobApplications,
  getJobApplication,
  updateJobApplication,
  deleteJobApplication,
  createFromExtension,
} from '../controllers/jobApplicationController';

const router = express.Router();

// Validation middleware
const jobApplicationValidation = [
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('roleTitle').notEmpty().withMessage('Role title is required'),
  body('status')
    .isIn(['To Apply', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'])
    .withMessage('Invalid status'),
  body('jobPostUrl').optional().isURL().withMessage('Invalid job post URL'),
  body('submissionDeadline').optional().isISO8601().withMessage('Invalid submission deadline date'),
  body('isDreamCompany').optional().isBoolean().withMessage('isDreamCompany must be a boolean'),
];

// Extension validation (less strict)
const extensionValidation = [
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('roleTitle').notEmpty().withMessage('Role title is required'),
  body('jobPostUrl').optional().isURL().withMessage('Invalid job post URL'),
];

// Routes
router.post('/', auth, jobApplicationValidation, createJobApplication);
router.post('/extension', auth, extensionValidation, createFromExtension);
router.get('/', auth, getJobApplications);
router.get('/:id', auth, getJobApplication);
router.put('/:id', auth, jobApplicationValidation, updateJobApplication);
router.delete('/:id', auth, deleteJobApplication);

export default router; 