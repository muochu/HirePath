import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface KPISettingsData {
  dailyTarget: number;
  level: 'Just Looking' | 'Really Want It' | 'Desperate';
  dreamCompanies: string[];
}

const KPISettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<KPISettingsData>({
    dailyTarget: user?.kpiSettings?.dailyTarget || 10,
    level: (user?.kpiSettings?.level as KPISettingsData['level']) || 'Just Looking',
    dreamCompanies: user?.kpiSettings?.dreamCompanies || [],
  });
  const [newCompany, setNewCompany] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${process.env.VITE_API_URL}/api/users/me`);
      setSettings(response.data.kpiSettings);
    } catch (error) {
      console.error('Error fetching KPI settings:', error);
      setError('Failed to load KPI settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.put(`${process.env.VITE_API_URL}/api/users/kpi-settings`, settings);
      setSuccess('KPI settings updated successfully');
    } catch (error) {
      console.error('Error updating KPI settings:', error);
      setError('Failed to update KPI settings');
    }
  };

  const handleAddCompany = () => {
    if (newCompany.trim() && !settings.dreamCompanies.includes(newCompany.trim())) {
      setSettings({
        ...settings,
        dreamCompanies: [...settings.dreamCompanies, newCompany.trim()],
      });
      setNewCompany('');
    }
  };

  const handleRemoveCompany = (company: string) => {
    setSettings({
      ...settings,
      dreamCompanies: settings.dreamCompanies.filter((c) => c !== company),
    });
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
      <Typography variant="h4" component="h1" gutterBottom>
        KPI Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type="number"
            label="Daily Application Target"
            value={settings.dailyTarget}
            onChange={(e) =>
              setSettings({ ...settings, dailyTarget: parseInt(e.target.value) })
            }
            margin="normal"
            inputProps={{ min: 1 }}
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Job Search Level</InputLabel>
            <Select
              value={settings.level}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  level: e.target.value as 'Just Looking' | 'Really Want It' | 'Desperate',
                })
              }
              label="Job Search Level"
            >
              <MenuItem value="Just Looking">Just Looking</MenuItem>
              <MenuItem value="Really Want It">Really Want It</MenuItem>
              <MenuItem value="Desperate">Desperate</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dream Companies
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="Add Dream Company"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCompany();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddCompany}
                disabled={!newCompany.trim()}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {settings.dreamCompanies.map((company) => (
                <Chip
                  key={company}
                  label={company}
                  onDelete={() => handleRemoveCompany(company)}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" color="primary">
              Save Settings
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default KPISettings; 