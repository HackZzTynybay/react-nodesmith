
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { OnboardingProvider } from "@/context/OnboardingContext";

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import EditEmail from "@/pages/auth/EditEmail";
import CreatePassword from "@/pages/auth/CreatePassword";

// Onboarding pages
import Departments from "@/pages/onboarding/Departments";
import Roles from "@/pages/onboarding/Roles";
import Employees from "@/pages/onboarding/Employees";

// Dashboard page
import Dashboard from "@/pages/Dashboard";

// Main app pages
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OnboardingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Email verification routes */}
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/edit-email" element={<EditEmail />} />
              <Route path="/create-password" element={<CreatePassword />} />
              
              {/* Onboarding routes - now directly accessible */}
              <Route path="/onboarding/departments" element={<Departments />} />
              <Route path="/onboarding/roles" element={<Roles />} />
              <Route path="/onboarding/employees" element={<Employees />} />
              
              {/* Dashboard route */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </OnboardingProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
