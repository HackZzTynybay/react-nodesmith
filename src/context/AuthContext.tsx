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
  register: (userData: any) => Promise<any>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<any>;
  updateEmail: (newEmail: string) => Promise<void>;
  createPassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Dummy user data - already authenticated
  const [user, setUser] = useState<User | null>({
    id: '1',
    email: 'admin@example.com',
    fullName: 'Admin User',
    role: 'Super Admin',
    isEmailVerified: true,
    companyName: 'Example Company',
  });
  
  const [company, setCompany] = useState<Company | null>({
    id: '1',
    name: 'Example Company',
    email: 'contact@example.com',
    phone: '+1 (555) 123-4567',
    companyId: 'EXC12345',
    employeeCount: '51-200',
    isOnboardingComplete: false,
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Simulate API calls with dummy data
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Simulate login
      toast({
        title: "Login successful",
        description: "Welcome back to EasyHR",
      });
      
      // Return dummy user
      setUser({
        id: '1',
        email: email,
        fullName: 'Admin User',
        role: 'Super Admin',
        isEmailVerified: true,
      });
      
      setCompany({
        id: '1',
        name: 'Example Company',
        email: 'contact@example.com',
        isOnboardingComplete: false,
      });
      
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
    // Do nothing for now - keeping the user logged in
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      
      // Just set the user with the provided data without actual registration
      const newUser = {
        id: '1',
        email: userData.email,
        fullName: userData.fullName,
        role: 'Super Admin',
        isEmailVerified: true,
      };
      
      setUser(newUser);
      
      const newCompany = {
        id: '1',
        name: userData.companyName,
        email: userData.email,
      };
      
      setCompany(newCompany);
      
      toast({
        title: "Registration successful",
        description: "You are now registered with dummy data",
      });
      
      return { success: true, data: { user: newUser, company: newCompany } };
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

  const verifyEmail = async (token: string): Promise<any> => {
    // Always succeed
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isEmailVerified: true
      };
    });
    return { success: true };
  };

  const resendVerification = async (): Promise<any> => {
    // Always succeed
    toast({
      title: "Email sent",
      description: "Verification email has been resent (dummy data)",
    });
    return { success: true };
  };

  const updateEmail = async (newEmail: string): Promise<any> => {
    // Update email without verification
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        email: newEmail,
        isEmailVerified: true
      };
    });
    
    toast({
      title: "Email updated",
      description: "Your email has been updated successfully (dummy data).",
    });
    
    return { success: true };
  };

  const createPassword = async (password: string) => {
    // Just show success
    toast({
      title: "Password created",
      description: "Your password has been set successfully (dummy data)",
    });
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: true, // Always authenticated
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
