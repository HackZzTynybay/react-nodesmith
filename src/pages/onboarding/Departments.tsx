
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useOnboarding, Department } from '@/context/OnboardingContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FormField } from '@/components/Form/FormField';
import { Plus, X } from 'lucide-react';
import { z } from 'zod';

const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  lead: z.string().optional(),
});

type DepartmentForm = z.infer<typeof departmentSchema>;

const Departments = () => {
  const navigate = useNavigate();
  const { departments, addDepartment, currentStep, nextStep } = useOnboarding();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [formData, setFormData] = useState<DepartmentForm>({
    name: '',
    email: '',
    lead: '',
  });
  const [errors, setErrors] = useState<Partial<DepartmentForm>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof DepartmentForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const result = departmentSchema.safeParse(formData);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        const newErrors: Partial<DepartmentForm> = {};
        
        // Extract and format errors - fixed type issue
        Object.keys(formattedErrors).forEach(key => {
          if (key !== '_errors') {
            const fieldErrors = formattedErrors[key as keyof typeof formattedErrors];
            if (fieldErrors && 'string' !== typeof fieldErrors && '_errors' in fieldErrors) {
              const errorMsg = fieldErrors._errors[0];
              if (errorMsg) {
                newErrors[key as keyof DepartmentForm] = errorMsg;
              }
            }
          }
        });
        
        setErrors(newErrors);
        return;
      }
      
      // Add department
      addDepartment({
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email || undefined,
        lead: formData.lead || undefined,
      });
      
      // Close sheet and reset form
      setIsSheetOpen(false);
      setFormData({
        name: '',
        email: '',
        lead: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error adding department:', error);
    }
  };

  const openAddDepartmentSheet = () => {
    setIsSheetOpen(true);
  };

  const handleNext = () => {
    nextStep();
    navigate('/onboarding/roles');
  };

  const handleSkip = () => {
    nextStep();
    navigate('/onboarding/roles');
  };

  return (
    <OnboardingLayout
      title="Set Up Your Departments"
      subtitle="Create and organize your company's department structure"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.length > 0 && departments.map((department) => (
            <DepartmentCard key={department.id} department={department} />
          ))}
          
          <button
            onClick={openAddDepartmentSheet}
            className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <Plus className="h-6 w-6 text-gray-400" />
            <span className="mt-2 text-sm font-medium text-gray-500">Add Department</span>
          </button>
        </div>
        
        <div className="flex justify-end space-x-4 mt-8">
          <Button variant="outline" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleNext}>
            Save & Next
          </Button>
        </div>
      </div>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>Add Department</SheetTitle>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <FormField
              id="name"
              label="Department Name"
              placeholder="Enter department name"
              required
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />
            
            <FormField
              id="email"
              label="Group email"
              type="email"
              placeholder="person@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
            
            <FormField
              id="lead"
              label="Department Lead"
              placeholder="Search employee"
              value={formData.lead}
              onChange={handleChange}
              error={errors.lead}
            />
            
            <div className="flex justify-end space-x-4 pt-6 mt-6 border-t">
              <Button variant="outline" type="button" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </OnboardingLayout>
  );
};

const DepartmentCard: React.FC<{ department: Department }> = ({ department }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="font-medium text-gray-900">{department.name}</h3>
      {department.email && <p className="text-sm text-gray-500 mt-1">{department.email}</p>}
    </div>
  );
};

export default Departments;
