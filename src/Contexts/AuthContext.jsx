import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { studentService } from '../services/studentService';
import { adminService } from '../services/adminService';
import { recruiterService } from '../services/recruiterService';
import { showSuccess, showError, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/errorHandler';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = () => {
      if (authService.checkAuthWithExpiry()) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        // Session expired or invalid
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Set up periodic session expiry check (every 5 minutes)
  useEffect(() => {
    const sessionCheckInterval = setInterval(() => {
      if (isAuthenticated && authService.isSessionExpired()) {
        console.log('Session expired - auto logging out');
        showError('Your session has expired. Please log in again.');
        logout();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(sessionCheckInterval);
  }, [isAuthenticated]);

  const login = async (email, password, role) => {
    try {
      const response = await authService.login(email, password, role);
      
      if (response.success && response.data && response.data.user) {
        // Use basic user data if profile fetch fails
        const userWithMembership = {
          ...response.data.user,
          membership: response.data.user.membership || 'free'
        };

        setUser(userWithMembership);
        setIsAuthenticated(true);

        showSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);
        return { success: true, user: userWithMembership };
      }
      
      throw new Error('Login failed - invalid response');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error?.error || error?.response?.data?.error || error?.message || '';
      if (errorMessage.includes('Recruiter not approved')) {
        showError('Your account is pending approval by an administrator.');
      } else {
        showError(error, ERROR_MESSAGES.LOGIN_FAILED);
      }
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      showSuccess(SUCCESS_MESSAGES.REGISTRATION_SUCCESS);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      showError(error, ERROR_MESSAGES.REGISTRATION_FAILED);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      showSuccess(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
    } catch (error) {
      console.error('Logout error:', error);
      showError(error, 'Logout failed');
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
      showSuccess('Password reset email sent successfully');
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      showError(error, 'Failed to send password reset email');
      throw error;
    }
  };

  const resetPassword = async (token, newPassword, role, otp) => {
    try {
      const response = await authService.resetPassword(token, newPassword, role, otp);
      showSuccess(SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS);
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      showError(error, ERROR_MESSAGES.PASSWORD_RESET_FAILED);
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(user.user_id, currentPassword, newPassword);
      showSuccess('Password changed successfully');
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      showError(error, 'Failed to change password');
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
