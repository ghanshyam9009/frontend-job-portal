import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';

const ProtectedRoute = ({ children, role = 'candidate' }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Wait for auth hydration on initial load/refresh
  if (loading) {
    return null;
  }

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

  // Additional authorization checks for recruiters
  if (role === 'recruiter' && user?.role === 'recruiter') {
    // Check if recruiter account is approved
    if (user.hasadminapproved === false) {
      // If status is rejected, redirect to appropriate page
      if (user.status === 'rejected') {
        return (
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{
              maxWidth: '500px',
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Account Rejected</h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                Unfortunately, your recruiter account has been rejected by our admin team.
                {user.rejection_reason && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    textAlign: 'left'
                  }}>
                    <strong>Reason:</strong><br />
                    {user.rejection_reason}
                  </div>
                )}
              </p>
              <p style={{ color: '#374151', marginBottom: '1.5rem' }}>
                You can contact support for more information or reapply with a new account.
              </p>
              <button
                onClick={() => window.location.href = '/recruiter/login'}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        );
      } else {
        // Pending approval
        return (
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{
              maxWidth: '500px',
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <h2 style={{ color: '#f59e0b', marginBottom: '1rem' }}>Account Pending Approval</h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                Your recruiter account is pending approval by our admin team.
                You will be notified once the review is complete.
              </p>
              <p style={{ color: '#374151', marginBottom: '1.5rem' }}>
                Please check back later or contact support if you have questions.
              </p>
              <button
                onClick={() => window.location.href = '/recruiter/login'}
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        );
      }
    }
  }

  return children;
};

export default ProtectedRoute;
