
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';

interface OnboardingRouteProps {
  children: React.ReactNode;
}

const OnboardingRoute: React.FC<OnboardingRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { currentStep, isOnboardingComplete } = useOnboarding();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If onboarding is complete, redirect to dashboard
  if (isOnboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Get the path for the current onboarding step
  const getCorrectOnboardingPath = () => {
    switch (currentStep) {
      case 1:
        return '/onboarding/departments';
      case 2:
        return '/onboarding/roles';
      case 3:
        return '/onboarding/employees';
      default:
        return '/onboarding/departments';
    }
  };
  
  // Get the current path
  const currentPath = window.location.pathname;
  const correctPath = getCorrectOnboardingPath();
  
  // If user is trying to access a step they shouldn't yet, redirect to the correct step
  if (currentPath !== correctPath) {
    return <Navigate to={correctPath} replace />;
  }
  
  // Render the onboarding step content
  return <>{children}</>;
};

export default OnboardingRoute;
