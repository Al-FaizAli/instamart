import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import API from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const verifySession = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
  
      if (!token || !storedUser) {
        setLoading(false);
        return;
      }
  
      // Skip verification during login or signup
      if (
        window.location.pathname.includes('/login') ||
        window.location.pathname.includes('/signup')
      ) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      }
  
      // Verify token with the backend
      const response = await API.get('/api/auth/verify');
  
      if (response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
  
        // Update token if a new one is issued
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
      }
    } catch (error) {
      console.error('Session verification error:', error);
  
      // Stop infinite requests by clearing auth and redirecting to login
      if (error.response?.status === 401) {
        clearAuth();
        window.location.href = '/login'; // Redirect to login page
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await API.post('api/auth/logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
    }
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    verifySession();

    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        verifySession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [verifySession]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verifySession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};