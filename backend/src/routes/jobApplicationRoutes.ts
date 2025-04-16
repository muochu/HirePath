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
} from '../controllers/jobApplicationController';

const router = express.Router();

// Validation middleware
const jobApplicationValidation = [
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('roleTitle').notEmpty().withMessage('Role title is required'),
  body('status')
    .isIn(['To Apply', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'])
    .withMessage('Invalid status'),
  body('applicationDate')
    .isISO8601()
    .withMessage('Invalid application date'),
  body('jobPostUrl')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Job post URL must be a string'),
  body('submissionDeadline')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid submission deadline date'),
  body('isDreamCompany')
    .optional()
    .isBoolean()
    .withMessage('isDreamCompany must be a boolean'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),
  validate
];

// Routes
router.post('/', auth, jobApplicationValidation, createJobApplication);
router.get('/', auth, getJobApplications);
router.get('/:id', auth, getJobApplication);
router.put('/:id', auth, jobApplicationValidation, updateJobApplication);
router.delete('/:id', auth, deleteJobApplication);

export default router; 