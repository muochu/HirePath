import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { JobApplicationForm } from '../components/JobApplicationForm';
import { JobApplication, JobApplicationFormData, JobApplicationStatus } from '../types/JobApplication';

const statusOptions: JobApplicationStatus[] = [
  'To Apply',
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected',
  'Withdrawn',
];

const statusColors: { [key in JobApplicationStatus]: string } = {
  'To Apply': 'default',
  'Applied': 'primary',
  'Interviewing': 'warning',
  'Offer': 'success',
  'Rejected': 'error',
  'Withdrawn': 'default',
};

const JobApplications: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    isDreamCompany: '',
    submissionDeadline: '',
    companyName: '',
  });

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      console.log('Fetching applications...');
      const response = await axios.get<any[]>(`/api/applications?${queryParams}`);
      console.log('Applications data:', response.data);
      
      // Transform the API response into JobApplication objects
      const transformedApplications: JobApplication[] = response.data.map(app => ({
        ...app,
        _id: app._id, // Ensure _id is present
        applicationDate: new Date(app.applicationDate),
        submissionDeadline: app.submissionDeadline ? new Date(app.submissionDeadline) : null,
        createdAt: app.createdAt ? new Date(app.createdAt) : undefined,
        updatedAt: app.updatedAt ? new Date(app.updatedAt) : undefined,
      }));
      
      setApplications(transformedApplications);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      setError(error?.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleOpen = () => {
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (formData: JobApplicationFormData) => {
    try {
      setLoading(true);
      setError('');
      console.log('Saving application:', formData);
      
      // Convert dates to ISO strings for the API
      const apiData = {
        ...formData,
        applicationDate: formData.applicationDate.toISOString(),
        submissionDeadline: formData.submissionDeadline?.toISOString() || null,
      };
      
      if (editingId) {
        await axios.put(`/api/applications/${editingId}`, apiData);
      } else {
        await axios.post('/api/applications', apiData);
      }
      
      handleClose();
      fetchApplications();
    } catch (error: any) {
      console.error('Error saving application:', error);
      throw new Error(error?.response?.data?.message || 'Failed to save application');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (application: JobApplication) => {
    setEditingId(application._id);
    setError('');
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        setLoading(true);
        setError('');
        await axios.delete(`/api/applications/${id}`);
        fetchApplications();
      } catch (error: any) {
        console.error('Error deleting application:', error);
        setError(error?.response?.data?.message || 'Failed to delete application');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !open) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Job Applications
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add Application
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Dream Company</InputLabel>
              <Select
                value={filters.isDreamCompany}
                onChange={(e) => setFilters({ ...filters, isDreamCompany: e.target.value })}
                label="Dream Company"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Deadline</InputLabel>
              <Select
                value={filters.submissionDeadline}
                onChange={(e) => setFilters({ ...filters, submissionDeadline: e.target.value })}
                label="Deadline"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="past">Past</MenuItem>
                <MenuItem value="none">No Deadline</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Company Name"
              value={filters.companyName}
              onChange={(e) => setFilters({ ...filters, companyName: e.target.value })}
            />
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Application Date</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Dream Company</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application._id}>
                <TableCell>{application.companyName}</TableCell>
                <TableCell>{application.roleTitle}</TableCell>
                <TableCell>
                  <Chip
                    label={application.status}
                    color={statusColors[application.status] as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {application.applicationDate.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {application.submissionDeadline
                    ? application.submissionDeadline.toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell>
                  {application.isDreamCompany && (
                    <StarIcon color="warning" />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(application)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(application._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  {application.jobPostUrl && (
                    <IconButton
                      size="small"
                      onClick={() => window.open(application.jobPostUrl, '_blank')}
                    >
                      <LaunchIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <JobApplicationForm
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        initialData={editingId ? applications.find(app => app._id === editingId) : undefined}
        isEditing={!!editingId}
      />
    </Box>
  );
};

export default JobApplications; 