import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  Divider,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, setAuthToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const params = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(location.hash.replace('#', '?'));
      const token = params.get('token') || hashParams.get('token');
      const error = params.get('error');

      console.log('Auth callback triggered. URL params:', {
        token: token ? 'present' : 'missing',
        error: error || 'none',
        fullUrl: window.location.href
      });

      if (token) {
        try {
          setLoading(true);
          setError('');
          console.log('Received token from OAuth, initializing auth...');
          await setAuthToken(token);
          console.log('Auth token set successfully, redirecting...');
          // Clear URL parameters and hash
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/', { replace: true });
        } catch (err: any) {
          console.error('Error initializing auth state:', err);
          setError(err?.response?.data?.message || 'Failed to initialize session. Please try again.');
          // Remove token from localStorage if initialization failed
          localStorage.removeItem('token');
        } finally {
          setLoading(false);
        }
      } else if (error) {
        console.error('OAuth error:', error);
        switch (error) {
          case 'no_user':
            setError('No user found. Please try again.');
            break;
          case 'server_config':
            setError('Server configuration error. Please contact support.');
            break;
          case 'auth_failed':
            setError('Authentication failed. Please try again.');
            break;
          default:
            setError(`Failed to sign in with Google. Error: ${error}`);
        }
      }
    };

    handleAuthCallback();
  }, [location, navigate, setAuthToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError('');
    const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000';
    const redirectUrl = `${apiUrl}/api/auth/google`;
    console.log('Initiating Google Sign In. Redirecting to:', redirectUrl);
    window.location.href = redirectUrl;
  };

  return (
    <Container 
      component="main" 
      maxWidth={false}
      sx={{ 
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        margin: 0,
        width: '100vw'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: '400px',
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
          margin: '0 auto'
        }}
      >
        <Typography component="h1" variant="h5">
          Welcome to HirePath
        </Typography>
        <Typography component="h2" variant="h6" sx={{ mt: 2, mb: 3 }}>
          Sign in to your account
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          sx={{ mb: 3 }}
        >
          Sign in with Google
        </Button>
        <Divider sx={{ width: '100%', mb: 3 }}>
          <Typography color="text.secondary" variant="body2">
            OR
          </Typography>
        </Divider>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/register" variant="body2">
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 