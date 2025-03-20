import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

// Protected Route component to restrict access based on authentication and roles
const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading } = useAuth();
  console.log('ProtectedRoute:', { user, loading, requiredRole });

  // Show loading state while checking authentication
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="calc(100vh - 128px)"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If role is required but user doesn't have it, redirect to dashboard
  if (requiredRole) {
    const isProjectManager = user.role === 'project_manager';
    const isSiteSupervisor = user.role === 'site_supervisor';

    // Check if the role is in an array of allowed roles
    if (Array.isArray(requiredRole) && !requiredRole.includes(user.role)) {
      console.log('User role not in allowed roles, redirecting to dashboard');
      return <Navigate to="/" replace />;
    }
    // Check if it's a single role string that doesn't match
    else if (typeof requiredRole === 'string') {
      if (requiredRole === 'project_manager' && !isProjectManager) {
        console.log('User is not a project manager, redirecting to dashboard');
        return <Navigate to="/" replace />;
      }
      if (requiredRole === 'site_supervisor' && !isSiteSupervisor) {
        console.log('User is not a site supervisor, redirecting to dashboard');
        return <Navigate to="/" replace />;
      }
    }
  }

  // If authenticated and has required role (or no role required), render children
  console.log('Access granted, rendering protected content');
  return <Outlet />;
};

export default ProtectedRoute;
