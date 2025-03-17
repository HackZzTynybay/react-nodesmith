
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/Form/FormField';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/context/AuthContext';

const editEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type EditEmailFormData = z.infer<typeof editEmailSchema>;

const EditEmail = () => {
  const navigate = useNavigate();
  const { user, updateEmail } = useAuth();
  
  const [formData, setFormData] = useState<EditEmailFormData>({
    email: user?.email || '',
  });
  
  const [errors, setErrors] = useState<Partial<EditEmailFormData>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof EditEmailFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate form data
      const result = editEmailSchema.safeParse(formData);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        const newErrors: Partial<EditEmailFormData> = {};
        
        // Extract and format errors
        Object.keys(formattedErrors).forEach(key => {
          if (key !== '_errors') {
            const errorMsg = formattedErrors[key as keyof typeof formattedErrors]?._errors[0];
            if (errorMsg) {
              newErrors[key as keyof EditEmailFormData] = errorMsg;
            }
          }
        });
        
        setErrors(newErrors);
        setLoading(false);
        return;
      }
      
      // Update email
      await updateEmail(formData.email);
      
      // Navigate back to verification page
      navigate('/verify-email');
    } catch (error) {
      console.error('Email update error:', error);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/verify-email');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <AuthLayout
      title="Update your email address"
      subtitle="Please enter your new email address below"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm text-gray-600 mb-2">Current email</p>
          <p className="text-sm font-medium">{user.email}</p>
        </div>
        
        <FormField
          id="email"
          label="New email address"
          type="email"
          placeholder="Enter your new email address"
          required
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          Save Changes
        </Button>
        
        <Button 
          type="button" 
          className="w-full" 
          variant="outline" 
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </form>
    </AuthLayout>
  );
};

export default EditEmail;
