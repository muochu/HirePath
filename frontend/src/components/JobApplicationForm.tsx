import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { JobApplicationFormData, JobApplicationStatus } from '../types/JobApplication';
import { useTheme } from '@mui/material/styles';

const STATUS_OPTIONS: JobApplicationStatus[] = [
  'To Apply',
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected',
  'Withdrawn',
];

interface JobApplicationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: JobApplicationFormData) => Promise<void>;
  initialData?: Partial<JobApplicationFormData>;
  isEditing?: boolean;
}

type FormErrors = {
  [K in keyof JobApplicationFormData]?: string;
} & {
  submit?: string;
};

const defaultFormData: JobApplicationFormData = {
  companyName: '',
  roleTitle: '',
  status: 'To Apply',
  applicationDate: new Date(),
  submissionDeadline: null,
  isDreamCompany: false,
  jobPostUrl: '',
  notes: '',
};

export const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData = {},
  isEditing = false,
}) => {
  const theme = useTheme();
  const previousOpen = useRef(open);

  const [formData, setFormData] = useState<JobApplicationFormData>(() => ({
    ...defaultFormData,
    ...initialData,
    applicationDate: initialData.applicationDate || new Date(),
    submissionDeadline: initialData.submissionDeadline || null,
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only reset form when dialog opens (not on every render)
  useEffect(() => {
    if (open && !previousOpen.current) {
      const newFormData = {
        ...defaultFormData,
        ...initialData,
        applicationDate: initialData.applicationDate || new Date(),
        submissionDeadline: initialData.submissionDeadline || null,
      };
      setFormData(newFormData);
      setErrors({});
      setIsSubmitting(false);
    }
    previousOpen.current = open;
  }, [open, initialData]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    } else if (formData.companyName.length > 200) {
      newErrors.companyName = 'Company name must be less than 200 characters';
    }

    if (!formData.roleTitle.trim()) {
      newErrors.roleTitle = 'Role title is required';
    } else if (formData.roleTitle.length > 200) {
      newErrors.roleTitle = 'Role title must be less than 200 characters';
    }

    if (!formData.applicationDate) {
      newErrors.applicationDate = 'Application date is required';
    }

    if (formData.submissionDeadline && formData.applicationDate && 
        formData.submissionDeadline < formData.applicationDate) {
      newErrors.submissionDeadline = 'Deadline must be after application date';
    }

    if (formData.jobPostUrl) {
      try {
        new URL(formData.jobPostUrl);
      } catch {
        newErrors.jobPostUrl = 'Invalid URL format';
      }
    }

    if (formData.notes && formData.notes.length > 2000) {
      newErrors.notes = 'Notes must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to submit application',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    field: keyof JobApplicationFormData,
    value: string | boolean | Date | null
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined, submit: undefined }));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            p: theme.spacing(2),
            [theme.breakpoints.up('sm')]: {
              minHeight: '60vh',
            },
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {isEditing ? 'Edit Job Application' : 'Add New Job Application'}
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              {errors.submit && (
                <Grid item xs={12}>
                  <Alert severity="error">{errors.submit}</Alert>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  error={!!errors.companyName}
                  helperText={errors.companyName}
                  required
                  inputProps={{ maxLength: 200 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role Title"
                  value={formData.roleTitle}
                  onChange={(e) => handleChange('roleTitle', e.target.value)}
                  error={!!errors.roleTitle}
                  helperText={errors.roleTitle}
                  required
                  inputProps={{ maxLength: 200 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value as JobApplicationStatus)}
                    label="Status"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Application Date"
                  value={formData.applicationDate}
                  onChange={(newDate: Date | null) => handleChange('applicationDate', newDate || new Date())}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.applicationDate,
                      helperText: errors.applicationDate,
                      required: true,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Submission Deadline (Optional)"
                  value={formData.submissionDeadline}
                  onChange={(newDate: Date | null) => handleChange('submissionDeadline', newDate)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.submissionDeadline,
                      helperText: errors.submissionDeadline,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Job Post URL (Optional)"
                  value={formData.jobPostUrl}
                  onChange={(e) => handleChange('jobPostUrl', e.target.value)}
                  error={!!errors.jobPostUrl}
                  helperText={errors.jobPostUrl}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isDreamCompany}
                      onChange={(e) => handleChange('isDreamCompany', e.target.checked)}
                    />
                  }
                  label="Dream Company"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notes (Optional)"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  error={!!errors.notes}
                  helperText={errors.notes ? errors.notes : `${(formData.notes?.length || 0)}/2000`}
                  inputProps={{ maxLength: 2000 }}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Application'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
}; 