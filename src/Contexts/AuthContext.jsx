import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = () => {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      console.log('Checking auth:', { token, currentUser });
      
      if (token && currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password, role) => {
    try {
      const response = await authService.login(email, password, role);
      
      if (response.success && response.data && response.data.user) {
        const userData = response.data.user;
        const userWithMembership = {
          ...userData,
          membership: userData.membership || 'free' // Default to free membership
        };
        
        setUser(userWithMembership);
        setIsAuthenticated(true);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        // After successful registration, automatically log in the user
        const { email, password, role } = userData;
        return await login(email, password, role);
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of API call success
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      if (response.success) {
        return response.data.token;
      }
      throw new Error('Token refresh failed');
    } catch (error) {
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const resetPassword = async (token, newPassword, role, otp) => {
    try {
      const response = await authService.resetPassword(token, newPassword, role, otp);
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(user.user_id, currentPassword, newPassword);
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    forgotPassword,
    resetPassword,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;
