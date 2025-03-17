
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/Form/FormField';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate form data
      const result = loginSchema.safeParse(formData);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        const newErrors: Partial<LoginFormData> = {};
        
        // Extract and format errors
        Object.keys(formattedErrors).forEach(key => {
          if (key !== '_errors') {
            const fieldKey = key as keyof LoginFormData;
            const fieldErrors = formattedErrors[fieldKey];
            if (fieldErrors && typeof fieldErrors === 'object' && '_errors' in fieldErrors) {
              const errorMsg = fieldErrors._errors[0];
              if (errorMsg) {
                newErrors[fieldKey] = errorMsg;
              }
            }
          }
        });
        
        setErrors(newErrors);
        setLoading(false);
        return;
      }
      
      // Login user
      await login(formData.email, formData.password);
      
      // Navigate to dashboard on success
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to your account"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="your.name@company.com"
          required
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        
        <FormField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          required
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={
            <button 
              type="button" 
              onClick={togglePasswordVisibility}
              className="text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-brand hover:underline">
            Forgot password?
          </Link>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </span>
          ) : (
            "Log In"
          )}
        </Button>
        
        <div className="text-center text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand hover:underline">
            Sign Up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
