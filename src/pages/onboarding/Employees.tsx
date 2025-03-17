
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useOnboarding, Employee, Department } from '@/context/OnboardingContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/Form/FormField';
import { FormSelect } from '@/components/Form/FormSelect';
import { FormDatePicker } from '@/components/Form/FormDatePicker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileUp, User, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.string().optional(),
  dateOfBirth: z.date().optional(),
  email: z.string().email('Please enter a valid email'),
  joiningDate: z.date().optional(),
  jobTitle: z.string().min(1, 'Job title is required'),
  department: z.string().optional(),
});

type EmployeeForm = Omit<z.infer<typeof employeeSchema>, 'dateOfBirth' | 'joiningDate'> & {
  dateOfBirth?: Date | string;
  joiningDate?: Date | string;
};

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const Employees = () => {
  const navigate = useNavigate();
  const { employees, departments, addEmployee, nextStep } = useOnboarding();
  
  const [activeTab, setActiveTab] = useState('manual');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<EmployeeForm>({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    jobTitle: '',
    department: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeForm, string>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof EmployeeForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user selects an option
    if (errors[name as keyof EmployeeForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [name]: date }));
    
    // Clear error when user selects a date
    if (errors[name as keyof EmployeeForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleCsvSubmit = () => {
    // In a real app, this would process the CSV file
    // For now, we'll just close the dialog
    setIsDialogOpen(false);
    setCsvFile(null);
  };

  const handleEmployeeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Convert string dates to Date objects for validation
      const dataToValidate = {
        ...formData,
        dateOfBirth: formData.dateOfBirth instanceof Date ? formData.dateOfBirth : undefined,
        joiningDate: formData.joiningDate instanceof Date ? formData.joiningDate : undefined,
      };
      
      // Validate form data
      const result = employeeSchema.safeParse(dataToValidate);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        const newErrors: Partial<Record<keyof EmployeeForm, string>> = {};
        
        // Extract and format errors
        Object.keys(formattedErrors).forEach(key => {
          if (key !== '_errors') {
            const errorMsg = formattedErrors[key as keyof typeof formattedErrors]?._errors[0];
            if (errorMsg) {
              newErrors[key as keyof EmployeeForm] = errorMsg;
            }
          }
        });
        
        setErrors(newErrors);
        return;
      }
      
      // Add employee
      addEmployee({
        id: Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth instanceof Date 
          ? formData.dateOfBirth.toISOString().split('T')[0] 
          : formData.dateOfBirth,
        email: formData.email,
        joiningDate: formData.joiningDate instanceof Date 
          ? formData.joiningDate.toISOString().split('T')[0] 
          : formData.joiningDate,
        jobTitle: formData.jobTitle,
        department: formData.department,
      });
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        gender: '',
        email: '',
        jobTitle: '',
        department: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const openAddEmployeeDialog = () => {
    setIsDialogOpen(true);
  };

  const handleNext = () => {
    nextStep();
    navigate('/dashboard');
  };

  const handleSkip = () => {
    nextStep();
    navigate('/dashboard');
  };

  const departmentOptions = departments.map(dept => ({
    value: dept.id,
    label: dept.name,
  }));

  return (
    <OnboardingLayout
      title="Import Employees"
      subtitle="Choose your preferred method to import employees"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileUp className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">CSV Import</h3>
          <p className="text-sm text-gray-500 mb-6">
            Upload your employee data using our CSV template
          </p>
          
          <div className="mt-auto w-full border border-gray-200 rounded p-4 bg-gray-50 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-2">
              Drag and drop your CSV file
              <br />
              or click to browse
            </p>
            <Button variant="outline" onClick={() => setActiveTab('csv')} className="mt-2">
              Download sample
            </Button>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">Add Manually</h3>
          <p className="text-sm text-gray-500 mb-6">
            Add employees one by one manually
          </p>
          
          <Button 
            variant="outline" 
            className="mt-auto"
            onClick={openAddEmployeeDialog}
          >
            Add Employee
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 mt-8">
        <Button variant="outline" onClick={handleSkip}>
          Skip
        </Button>
        <Button onClick={handleNext}>
          Save & Next
        </Button>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'manual' ? 'Add employee' : 'Match Columns'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Add Manually</TabsTrigger>
              <TabsTrigger value="csv">CSV Import</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="mt-4">
              <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Basic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id="firstName"
                      label="First Name"
                      placeholder="Enter first name"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      error={errors.firstName}
                    />
                    
                    <FormField
                      id="lastName"
                      label="Last Name"
                      placeholder="Enter last name"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      error={errors.lastName}
                    />
                    
                    <FormSelect
                      id="gender"
                      label="Gender"
                      placeholder="Select"
                      options={genderOptions}
                      required
                      value={formData.gender}
                      onChange={(value) => handleSelectChange('gender', value)}
                      error={errors.gender}
                    />
                    
                    <FormDatePicker
                      id="dateOfBirth"
                      label="Date of Birth"
                      required
                      value={formData.dateOfBirth instanceof Date ? formData.dateOfBirth : undefined}
                      onChange={(date) => handleDateChange('dateOfBirth', date)}
                      error={errors.dateOfBirth}
                    />
                    
                    <FormField
                      id="email"
                      label="Official Email"
                      type="email"
                      placeholder="Enter official mail"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-3">Employment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormDatePicker
                      id="joiningDate"
                      label="Joining Date"
                      required
                      value={formData.joiningDate instanceof Date ? formData.joiningDate : undefined}
                      onChange={(date) => handleDateChange('joiningDate', date)}
                      error={errors.joiningDate}
                    />
                    
                    <FormField
                      id="jobTitle"
                      label="Job Title"
                      placeholder="Enter job title"
                      required
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      error={errors.jobTitle}
                    />
                    
                    <FormSelect
                      id="department"
                      label="Department"
                      placeholder="Select"
                      options={departmentOptions}
                      required
                      value={formData.department}
                      onChange={(value) => handleSelectChange('department', value)}
                      error={errors.department}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-6">
                  <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Next
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="csv" className="mt-4">
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <h3 className="text-sm font-medium mb-1">
                      {csvFile ? csvFile.name : 'Drag and drop your CSV file'}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      {csvFile ? `${(csvFile.size / 1024).toFixed(2)} KB` : 'or click to browse'}
                    </p>
                    
                    <input
                      type="file"
                      id="csv-upload"
                      accept=".csv"
                      className="hidden"
                      onChange={handleCsvUpload}
                    />
                    <label htmlFor="csv-upload">
                      <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                        <span>Browse Files</span>
                      </Button>
                    </label>
                  </div>
                </div>
                
                {csvFile ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Match Columns</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                      Please map the columns from your CSV file to our system fields
                    </p>
                    
                    <div className="space-y-3">
                      <FormSelect
                        id="firstName"
                        label="First Name"
                        placeholder="Select"
                        required
                        options={[{ value: 'first_name', label: 'First Name' }]}
                        value="first_name"
                        onChange={() => {}}
                      />
                      
                      <FormSelect
                        id="lastName"
                        label="Last Name"
                        placeholder="Select"
                        required
                        options={[{ value: 'last_name', label: 'Last Name' }]}
                        value="last_name"
                        onChange={() => {}}
                      />
                      
                      <FormSelect
                        id="gender"
                        label="Gender"
                        placeholder="Select"
                        required
                        options={[{ value: 'gender', label: 'Gender' }]}
                        value="gender"
                        onChange={() => {}}
                      />
                      
                      {/* More mapping fields would go here */}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Button variant="link" className="text-brand">
                      Download sample CSV template
                    </Button>
                  </div>
                )}
                
                <div className="flex justify-end space-x-4">
                  <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCsvSubmit} disabled={!csvFile}>
                    Import
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </OnboardingLayout>
  );
};

export default Employees;
