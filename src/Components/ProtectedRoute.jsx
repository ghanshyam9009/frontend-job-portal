import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';

const ProtectedRoute = ({ children, role = 'candidate' }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    let loginPath = '/candidate/login';
    if (role === 'admin') {
      loginPath = '/admin/login';
    } else if (role === 'recruiter') {
      loginPath = '/recruiter/login';
    }
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Optional: Role-based authorization
  if (user && user.role !== role) {
    // Redirect to a 'not authorized' page or home page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
