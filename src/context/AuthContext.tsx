
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isEmailVerified?: boolean;
  companyName?: string;
};

type Company = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyId?: string;
  employeeCount?: string;
  isOnboardingComplete?: boolean;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  company: Company | null;
  setUser: (user: User | null) => void;
  setCompany: (company: Company | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  createPassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('easyhr_user');
    const storedCompany = localStorage.getItem('easyhr_company');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedCompany) {
      setCompany(JSON.parse(storedCompany));
    }
    
    setIsLoading(false);
  }, []);

  // Update localStorage when auth state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('easyhr_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('easyhr_user');
    }
  }, [user]);

  useEffect(() => {
    if (company) {
      localStorage.setItem('easyhr_company', JSON.stringify(company));
    } else {
      localStorage.removeItem('easyhr_company');
    }
  }, [company]);

  // Helper function for API calls
  const apiCall = async (endpoint: string, method: string, data?: any) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user ? `Bearer ${localStorage.getItem('easyhr_token')}` : '',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }
      
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, make an API call
      const result = await apiCall('/auth/login', 'POST', { email, password });
      
      if (result.success && result.data) {
        localStorage.setItem('easyhr_token', result.data.token);
        
        setUser({
          id: result.data.user.id,
          email: result.data.user.email,
          fullName: result.data.user.fullName,
          role: result.data.user.role,
          isEmailVerified: result.data.user.isEmailVerified,
        });
        
        if (result.data.company) {
          setCompany({
            id: result.data.company.id,
            name: result.data.company.name,
            email: result.data.company.email,
            isOnboardingComplete: result.data.company.isOnboardingComplete,
          });
        }
        
        toast({
          title: "Login successful",
          description: "Welcome back to EasyHR",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    localStorage.removeItem('easyhr_user');
    localStorage.removeItem('easyhr_company');
    localStorage.removeItem('easyhr_token');
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      
      // In a real app, make an API call
      const result = await apiCall('/auth/register', 'POST', userData);
      
      if (result.success && result.data) {
        setUser({
          id: result.data.user.id,
          email: result.data.user.email,
          fullName: result.data.user.fullName,
          role: result.data.user.role,
          isEmailVerified: result.data.user.isEmailVerified,
        });
        
        setCompany({
          id: result.data.company.id,
          name: result.data.company.name,
          email: result.data.company.email,
        });
        
        toast({
          title: "Registration successful",
          description: "Please verify your email to continue",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setIsLoading(true);
      
      // Make API call to verify email
      const result = await apiCall('/auth/verify-email', 'POST', { token });
      
      if (result.success) {
        // Update user's email verification status
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            isEmailVerified: true
          };
        });
        
        return result;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      toast({
        title: "Verification failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      setIsLoading(true);
      
      // Make API call to resend verification email
      const result = await apiCall('/auth/resend-verification', 'POST');
      
      if (result.success) {
        toast({
          title: "Email sent",
          description: "Verification email has been resent",
        });
        return result;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend';
      toast({
        title: "Failed to resend",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmail = async (newEmail: string) => {
    try {
      setIsLoading(true);
      
      // Make API call to update email
      const result = await apiCall('/auth/update-email', 'POST', { email: newEmail });
      
      if (result.success && result.data) {
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            email: newEmail,
            isEmailVerified: false
          };
        });
        
        toast({
          title: "Email updated",
          description: "Your email has been updated successfully. Please verify your new email.",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createPassword = async (password: string) => {
    try {
      setIsLoading(true);
      
      // Make API call to create password
      const result = await apiCall('/auth/create-password', 'POST', { password });
      
      if (result.success) {
        toast({
          title: "Password created",
          description: "Your password has been set successfully",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password creation failed';
      toast({
        title: "Password creation failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        company,
        setUser,
        setCompany,
        login,
        logout,
        register,
        verifyEmail,
        resendVerification,
        updateEmail,
        createPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
