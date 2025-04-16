import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  setAuthToken: (token: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setToken] = useState<string | null>(localStorage.getItem('token'));

  const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000';

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = apiUrl;
  }, [apiUrl]);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      console.log('Fetching user data from:', `${apiUrl}/api/users/me`);
      const response = await axios.get('/api/users/me');
      console.log('User data received:', response.data);
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user:', error);
      await logout();
      throw error;
    }
  }, [apiUrl, logout]);

  const setAuthToken = async (token: string): Promise<void> => {
    try {
      console.log('Setting auth token...');
      setToken(token);
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await fetchUser();
    } catch (error) {
      console.error('Error setting auth token:', error);
      await logout();
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/users/login', {
        email,
        password,
      });
      await setAuthToken(response.data.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await axios.post('/api/users/register', {
        email,
        password,
        name,
      });
      await setAuthToken(response.data.token);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (authToken) {
        try {
          console.log('Initializing auth with token...');
          axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
          await fetchUser();
        } catch (error) {
          console.error('Error initializing auth:', error);
          await logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [authToken, fetchUser, logout]);

  // Set up axios interceptor for 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated, 
      register,
      setAuthToken,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 