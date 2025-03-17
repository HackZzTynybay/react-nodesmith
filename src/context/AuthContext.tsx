
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  companyName?: string;
};

type Company = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyId?: string;
  employeeCount?: string;
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
  verifyEmail: () => Promise<void>;
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

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call
      // Simulating a successful login
      setUser({
        id: '123',
        email,
        fullName: 'John Doe',
        role: 'admin',
      });
      
      toast({
        title: "Login successful",
        description: "Welcome back to EasyHR",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
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
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call
      // Simulating registration
      const newCompany = {
        id: '456',
        name: userData.companyName,
        email: userData.email,
        phone: userData.phone,
        companyId: userData.companyId,
        employeeCount: userData.employeeCount,
      };
      
      const newUser = {
        id: '123',
        email: userData.email,
        fullName: userData.fullName,
        role: 'admin',
        companyName: userData.companyName,
      };
      
      setCompany(newCompany);
      setUser(newUser);
      
      toast({
        title: "Registration successful",
        description: "Please verify your email to continue",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please check your information and try again",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call
      toast({
        title: "Email verified",
        description: "Thank you for verifying your email",
      });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Unable to verify your email",
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
      // In a real app, this would be an API call
      toast({
        title: "Email sent",
        description: "Verification email has been resent",
      });
    } catch (error) {
      toast({
        title: "Failed to resend",
        description: "Unable to resend verification email",
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
      // In a real app, this would be an API call
      if (user) {
        setUser({
          ...user,
          email: newEmail,
        });
        
        toast({
          title: "Email updated",
          description: "Your email has been updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Unable to update your email",
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
      // In a real app, this would be an API call
      toast({
        title: "Password created",
        description: "Your password has been set successfully",
      });
    } catch (error) {
      toast({
        title: "Password creation failed",
        description: "Unable to set your password",
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
