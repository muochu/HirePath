import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Settings as SettingsIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface ApplicationStats {
  total: number;
  byStatus: {
    [key: string]: number;
  };
}

interface UserStats {
  stats: {
    totalApplications: number;
    applicationsThisMonth: number;
    applicationsThisWeek: number;
    applicationsToday: number;
    lastApplicationDate: string | null;
  };
  kpiSettings: {
    dailyTarget: number;
    level: string;
    dreamCompanies: string[];
  };
  progress: {
    daily: {
      current: number;
      target: number;
      percentage: number;
    };
    weekly: {
      current: number;
      target: number;
      percentage: number;
    };
    monthly: {
      current: number;
      target: number;
      percentage: number;
    };
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    byStatus: {},
  });
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [applicationsResponse, statsResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/applications`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/users/stats`),
      ]);

      const applications = applicationsResponse.data;
      const statusCounts = applications.reduce((acc: { [key: string]: number }, app: any) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});

      setStats({
        total: applications.length,
        byStatus: statusCounts,
      });
      setUserStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statusColors: { [key: string]: string } = {
    'To Apply': '#9e9e9e',
    'Applied': '#2196f3',
    'Interviewing': '#ff9800',
    'Offer': '#4caf50',
    'Rejected': '#f44336',
    'Withdrawn': '#757575',
  };

  const calculateProgress = (status: string) => {
    return (stats.byStatus[status] || 0) / (stats.total || 1) * 100;
  };

  if (loading) {
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
          Dashboard
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => navigate('/settings')}
            sx={{ mr: 2 }}
          >
            KPI Settings
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/applications')}
          >
            Add Application
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* KPI Progress Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Progress
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Daily Progress
                  </Typography>
                  <Typography variant="h6">
                    {userStats?.stats.applicationsToday} / {userStats?.kpiSettings?.dailyTarget || 0}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={userStats?.progress.daily.percentage || 0}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Weekly Progress
                  </Typography>
                  <Typography variant="h6">
                    {userStats?.stats.applicationsThisWeek} / {(userStats?.kpiSettings?.dailyTarget || 0) * 7}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={userStats?.progress.weekly.percentage || 0}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Monthly Progress
                  </Typography>
                  <Typography variant="h6">
                    {userStats?.stats.applicationsThisMonth} / {(userStats?.kpiSettings?.dailyTarget || 0) * 30}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={userStats?.progress.monthly.percentage || 0}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Application Status Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Application Status
            </Typography>
            {Object.keys(statusColors).map((status) => (
              <Box key={status} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{status}</Typography>
                  <Typography variant="body2">
                    {stats.byStatus[status] || 0}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress(status)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: statusColors[status],
                    },
                  }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Applications
              </Typography>
              <Typography variant="h3">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Applications
              </Typography>
              <Typography variant="h3">
                {(stats.byStatus['Applied'] || 0) +
                  (stats.byStatus['Interviewing'] || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Search Level
              </Typography>
              <Typography variant="h3">
                {userStats?.kpiSettings.level}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 