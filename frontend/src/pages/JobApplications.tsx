import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Link,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface JobApplication {
  _id: string;
  companyName: string;
  roleTitle: string;
  status: string;
  applicationDate: string;
  submissionDeadline?: string;
  isDreamCompany: boolean;
  jobPostUrl?: string;
  notes?: string;
}

const statusOptions = [
  'To Apply',
  'Applied',
  'Interviewing',
  'Offer',
  'Rejected',
  'Withdrawn',
];

const statusColors: { [key: string]: string } = {
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
  const [formData, setFormData] = useState({
    companyName: '',
    roleTitle: '',
    status: 'To Apply',
    submissionDeadline: '',
    isDreamCompany: false,
    jobPostUrl: '',
    notes: '',
  });
  const [filters, setFilters] = useState({
    status: '',
    isDreamCompany: '',
    submissionDeadline: '',
    companyName: '',
  });
  const [error, setError] = useState('');

  const fetchApplications = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/applications?${queryParams}`);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load applications');
    }
  }, [filters]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setFormData({
      companyName: '',
      roleTitle: '',
      status: 'To Apply',
      submissionDeadline: '',
      isDreamCompany: false,
      jobPostUrl: '',
      notes: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/applications/${editingId}`, formData);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/applications`, formData);
      }
      handleClose();
      fetchApplications();
    } catch (error) {
      console.error('Error saving application:', error);
      setError('Failed to save application');
    }
  };

  const handleEdit = (application: JobApplication) => {
    setEditingId(application._id);
    setFormData({
      companyName: application.companyName,
      roleTitle: application.roleTitle,
      status: application.status,
      submissionDeadline: application.submissionDeadline || '',
      isDreamCompany: application.isDreamCompany,
      jobPostUrl: application.jobPostUrl || '',
      notes: application.notes || '',
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/applications/${id}`);
        fetchApplications();
      } catch (error) {
        console.error('Error deleting application:', error);
        setError('Failed to delete application');
      }
    }
  };

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
                  {new Date(application.applicationDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {application.submissionDeadline
                    ? new Date(application.submissionDeadline).toLocaleDateString()
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
                      href={application.jobPostUrl}
                      target="_blank"
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Application' : 'Add New Application'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Company Name"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Role Title"
              value={formData.roleTitle}
              onChange={(e) =>
                setFormData({ ...formData, roleTitle: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              margin="normal"
              required
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              type="date"
              label="Submission Deadline"
              value={formData.submissionDeadline}
              onChange={(e) =>
                setFormData({ ...formData, submissionDeadline: e.target.value })
              }
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isDreamCompany}
                  onChange={(e) =>
                    setFormData({ ...formData, isDreamCompany: e.target.checked })
                  }
                />
              }
              label="Dream Company"
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Job Post URL"
              value={formData.jobPostUrl}
              onChange={(e) =>
                setFormData({ ...formData, jobPostUrl: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              margin="normal"
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? 'Save Changes' : 'Add Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobApplications; 