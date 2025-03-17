import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/Form/FormField';
import { FormSelect } from '@/components/Form/FormSelect';
import { FormCheckbox } from '@/components/Form/FormCheckbox';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const employeeCountOptions = [
  { value: '1-10', label: '1-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-500', label: '201-500' },
  { value: '501-1000', label: '501-1000' },
  { value: '1000+', label: '1000+' },
];

const registerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email('Please enter a valid work email address'),
  phone: z.string().optional(),
  companyId: z.string().min(1, 'Company identification number is required'),
  employeeCount: z.string().min(1, 'Number of employees is required'),
  fullName: z.string().min(1, 'Full name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms of service and privacy policy',
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    companyName: '',
    email: '',
    phone: '',
    companyId: '',
    employeeCount: '',
    fullName: '',
    jobTitle: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user selects an option
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
    
    // Clear error when user checks the box
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate form data
      const result = registerSchema.safeParse(formData);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};
        
        // Extract and format errors
        Object.keys(formattedErrors).forEach(key => {
          if (key !== '_errors') {
            const fieldKey = key as keyof RegisterFormData;
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
      
      // Submit form data
      await register(formData);
      
      // Navigate to email verification page on success
      navigate('/verify-email');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Show error toast with more details
      toast({
        title: "Registration failed",
        description: error instanceof Error 
          ? error.message 
          : "Cannot connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
      
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Get Started"
      subtitle="Set up your HRMS administrator account"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4">Company Information</h2>
          
          <FormField
            id="companyName"
            label="Company Name"
            placeholder="Enter your company name"
            required
            value={formData.companyName}
            onChange={handleChange}
            error={errors.companyName}
          />
          
          <FormField
            id="email"
            label="Work Email"
            type="email"
            placeholder="your.name@company.com"
            required
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          
          <FormField
            id="phone"
            label="Phone Number (Optional)"
            placeholder="+91 9876543210"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          
          <FormField
            id="companyId"
            label="Company Identification Number"
            placeholder="L12345MH2023PLC000789"
            required
            value={formData.companyId}
            onChange={handleChange}
            error={errors.companyId}
          />
          
          <FormSelect
            id="employeeCount"
            label="Number of Employees"
            placeholder="Select"
            options={employeeCountOptions}
            required
            value={formData.employeeCount}
            onChange={(value) => handleSelectChange('employeeCount', value)}
            error={errors.employeeCount}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-4">Your Information</h2>
          
          <FormField
            id="fullName"
            label="Full Name"
            placeholder="Enter your full name"
            required
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />
          
          <FormField
            id="jobTitle"
            label="Your Job Title"
            placeholder="Enter your job title"
            required
            value={formData.jobTitle}
            onChange={handleChange}
            error={errors.jobTitle}
          />
        </div>
        
        <FormCheckbox
          id="termsAccepted"
          label={
            <span>
              I agree to the{' '}
              <a href="/terms" className="text-brand hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="/privacy" className="text-brand hover:underline">Privacy Policy</a>
            </span>
          }
          checked={formData.termsAccepted}
          onChange={(checked) => handleCheckboxChange('termsAccepted', checked)}
          error={errors.termsAccepted}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </Button>
        
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:underline">
            Log In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
