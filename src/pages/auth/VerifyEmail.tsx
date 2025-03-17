
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const VerifyEmail = () => {
  const { user, resendVerification, verifyEmail } = useAuth();
  const [isResending, setIsResending] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verified, setVerified] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract verification token from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      handleVerification(token);
    }
  }, [location]);

  const handleVerification = async (token: string) => {
    setIsVerifying(true);
    try {
      await verifyEmail(token);
      setVerified(true);
      toast({
        title: "Email verified successfully",
        description: "You can now continue using the application",
        variant: "default",
      });
      
      // Redirect to appropriate page after short delay
      setTimeout(() => {
        navigate('/create-password');
      }, 2000);
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification failed",
        description: "The verification link may have expired. Please request a new one.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const result = await resendVerification();
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link",
      });
      
      // If in development, show preview URL
      if (result?.data?.emailPreview) {
        console.log('Email preview URL:', result.data.emailPreview);
        window.open(result.data.emailPreview, '_blank');
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      toast({
        title: "Failed to resend",
        description: "Could not send verification email. Please try again later.",
        variant: "destructive",
      });
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

  if (isVerifying) {
    return (
      <AuthLayout title="Verifying your email...">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-center text-sm text-muted-foreground">
            Please wait while we verify your email address
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (verified) {
    return (
      <AuthLayout 
        title="Email Verified!"
        subtitle="Your email has been successfully verified. You'll be redirected shortly."
      >
        <div className="flex justify-center">
          <Button
            onClick={() => navigate('/create-password')}
            className="mt-4"
          >
            Continue
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify your email to continue"
      subtitle={`We sent a verification link to ${user.email}. Check your inbox and spam folder.`}
    >
      <div className="space-y-6">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            The verification link will expire in 24 hours. If you don't see the email, 
            check your spam folder or request a new verification link.
          </p>
        </div>
        
        <Button 
          onClick={handleResend} 
          className="w-full"
          variant="outline"
          disabled={isResending}
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Resend Verification Email"
          )}
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
