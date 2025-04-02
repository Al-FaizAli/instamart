// src/utils/storage.js
export const setAuthData = (token, user) => {
    try {
      if (!token || !user) {
        throw new Error('Invalid auth data - token and user are required');
      }
  
      // Only store necessary user fields
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        _v: 1 // data version
      };
  
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to store auth data:', error);
      clearAuthData();
      throw error;
    }
  };
  
  export const getAuthData = () => {
    try {
      const token = localStorage.getItem('token');
      const userString = localStorage.getItem('user');
  
      if (!token || !userString) return null;
  
      const user = JSON.parse(userString);
  
      // Validate data structure
      if (user._v !== 1 || !user.id || !user.email) {
        throw new Error('Invalid user data structure');
      }
  
      return { token, user };
    } catch (error) {
      console.error('Failed to read auth data:', error);
      clearAuthData();
      return null;
    }
  };
  
  export const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };
  
  export const migrateLegacyData = () => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        // Check if data is corrupted (contains HTML)
        if (userString.includes('<!DOCTYPE') || userString.includes('<html')) {
          clearAuthData();
          return false;
        }
        
        // Try parsing to validate JSON
        JSON.parse(userString);
      }
      return true;
    } catch {
      clearAuthData();
      return false;
    }
  };