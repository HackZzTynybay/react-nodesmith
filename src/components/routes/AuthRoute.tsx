import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AuthRouteProps {
  children: React.ReactNode;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // If user is already authenticated and email verified, redirect to dashboard
  if (isAuthenticated && user?.isEmailVerified) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If user is authenticated but not email verified, redirect to email verification
  if (isAuthenticated && !user?.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  // Otherwise, render the auth page
  return <>{children}</>;
};

export default AuthRoute;
