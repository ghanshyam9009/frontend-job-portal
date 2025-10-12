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
        let profileResponse;
        try {
          switch (role) {
            case 'student':
            case 'candidate':
              profileResponse = await studentService.getProfile(email);
              break;
            case 'admin':
              profileResponse = await adminService.getProfile(email);
              break;
            case 'recruiter':
            case 'employer':
              profileResponse = await recruiterService.getProfile(email);
              break;
            default:
              throw new Error('Invalid role');
          }
          
          const userData = profileResponse.data || profileResponse;
          const userWithMembership = {
            ...userData,
            membership: userData.membership || 'free' // Default to free membership
          };
          
          setUser(userWithMembership);
          setIsAuthenticated(true);
          
          showSuccess(SUCCESS_MESSAGES.LOGIN_SUCCESS);
          return { success: true, user: userWithMembership };
        } catch (profileError) {
          console.warn('Profile fetch failed, using basic user data:', profileError);
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
      }
      
      throw new Error('Login failed - invalid response');
    } catch (error) {
      console.error('Login error:', error);
      showError(error, ERROR_MESSAGES.LOGIN_FAILED);
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        showSuccess(SUCCESS_MESSAGES.REGISTRATION_SUCCESS);
        // After successful registration, automatically log in the user
        const { email, password, role } = userData;
        return await login(email, password, role);
      }
      
      throw new Error(response.message || 'Registration failed');
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
