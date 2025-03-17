
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/Form/FormField';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Check } from 'lucide-react';

// Password schema with requirements
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .refine(password => /[A-Z]/.test(password), {
    message: 'Password must include at least one uppercase letter',
  })
  .refine(password => /[0-9]/.test(password), {
    message: 'Password must include at least one number',
  })
  .refine(password => /[!@#$%^&*(),.?":{}|<>]/.test(password), {
    message: 'Password must include at least one special character',
  });

type CreatePasswordFormData = {
  password: string;
};

const CreatePassword = () => {
  const navigate = useNavigate();
  const { user, createPassword } = useAuth();
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Password requirements state
  const [meetsLengthRequirement, setMeetsLengthRequirement] = useState(false);
  const [meetsUppercaseRequirement, setMeetsUppercaseRequirement] = useState(false);
  const [meetsNumberRequirement, setMeetsNumberRequirement] = useState(false);
  const [meetsSpecialCharRequirement, setMeetsSpecialCharRequirement] = useState(false);
  
  // Calculate password strength
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    // Check password requirements
    setMeetsLengthRequirement(password.length >= 8);
    setMeetsUppercaseRequirement(/[A-Z]/.test(password));
    setMeetsNumberRequirement(/[0-9]/.test(password));
    setMeetsSpecialCharRequirement(/[!@#$%^&*(),.?":{}|<>]/.test(password));
    
    // Calculate password strength (0-3)
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    setPasswordStrength(strength);
  }, [password]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate password
      passwordSchema.parse(password);
      
      // Create password
      await createPassword(password);
      
      // Navigate to departments setup page
      navigate('/onboarding/departments');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else {
        console.error('Password creation error:', error);
        setError('An error occurred while creating your password. Please try again.');
      }
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  // Get strength label and color
  const getStrengthLabel = () => {
    if (passwordStrength === 0) return 'Weak';
    if (passwordStrength === 1) return 'Fair';
    if (passwordStrength === 2) return 'Good';
    return 'Strong';
  };
  
  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-red-500';
    if (passwordStrength === 1) return 'bg-yellow-500';
    if (passwordStrength === 2) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <AuthLayout
      title="Secure Your Account"
      subtitle="Set up your password"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          required
          value={password}
          onChange={handleChange}
          error={error}
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
        
        {/* Password strength indicator */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{getStrengthLabel()} password</span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getStrengthColor()}`} 
              style={{ width: `${(passwordStrength / 4) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Password requirements */}
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <span className={`mr-2 ${meetsLengthRequirement ? 'text-green-500' : 'text-gray-400'}`}>
              {meetsLengthRequirement ? <Check size={16} /> : '○'}
            </span>
            <span className={meetsLengthRequirement ? 'text-green-600' : 'text-gray-600'}>
              At least 8 characters
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <span className={`mr-2 ${meetsUppercaseRequirement ? 'text-green-500' : 'text-gray-400'}`}>
              {meetsUppercaseRequirement ? <Check size={16} /> : '○'}
            </span>
            <span className={meetsUppercaseRequirement ? 'text-green-600' : 'text-gray-600'}>
              One uppercase letter
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <span className={`mr-2 ${meetsNumberRequirement ? 'text-green-500' : 'text-gray-400'}`}>
              {meetsNumberRequirement ? <Check size={16} /> : '○'}
            </span>
            <span className={meetsNumberRequirement ? 'text-green-600' : 'text-gray-600'}>
              One number
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <span className={`mr-2 ${meetsSpecialCharRequirement ? 'text-green-500' : 'text-gray-400'}`}>
              {meetsSpecialCharRequirement ? <Check size={16} /> : '○'}
            </span>
            <span className={meetsSpecialCharRequirement ? 'text-green-600' : 'text-gray-600'}>
              One special character
            </span>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || passwordStrength < 3}
        >
          Create Password
        </Button>
      </form>
    </AuthLayout>
  );
};

export default CreatePassword;
