
import React from 'react';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const VerifyEmail = () => {
  const { user, resendVerification } = useAuth();
  const [isResending, setIsResending] = React.useState(false);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerification();
    } catch (error) {
      console.error('Error resending verification:', error);
    } finally {
      setIsResending(false);
    }
  };

  if (!user) {
    return (
      <AuthLayout title="Session Expired">
        <div className="text-center">
          <p className="mb-6">Your session has expired or you are not logged in.</p>
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify your email to continue"
      subtitle={`We sent a verification link to ${user.email}. Check your inbox.`}
    >
      <div className="space-y-6">
        <Button 
          onClick={handleResend} 
          className="w-full"
          variant="outline"
          disabled={isResending}
        >
          Resend Email
        </Button>
        
        <div className="text-center">
          <Link to="/edit-email" className="text-sm text-brand hover:underline">
            Edit Email Address
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
