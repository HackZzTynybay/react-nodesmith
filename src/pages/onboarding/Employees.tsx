
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useOnboarding, Employee, Department } from '@/context/OnboardingContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FormField } from '@/components/Form/FormField';
import { FormSelect } from '@/components/Form/FormSelect';
import { FormDatePicker } from '@/components/Form/FormDatePicker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileUp, User, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';

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

type EmployeeForm = {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth?: Date;
  email: string;
  joiningDate?: Date;
  jobTitle: string;
  department: string;
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
    toast({
      title: "CSV Import",
      description: "Employees imported successfully!",
    });
    setIsSheetOpen(false);
    setCsvFile(null);
  };

  const handleEmployeeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const dataToValidate = {
        ...formData,
        // Ensure dateOfBirth and joiningDate are proper Date objects or undefined
        dateOfBirth: formData.dateOfBirth instanceof Date ? formData.dateOfBirth : undefined,
        joiningDate: formData.joiningDate instanceof Date ? formData.joiningDate : undefined,
      };
      
      const result = employeeSchema.safeParse(dataToValidate);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        const newErrors: Partial<Record<keyof EmployeeForm, string>> = {};
        
        // Extract and format errors
        Object.keys(formattedErrors).forEach(key => {
          if (key !== '_errors') {
            const fieldErrors = formattedErrors[key as keyof typeof formattedErrors];
            if (fieldErrors && 'string' !== typeof fieldErrors && '_errors' in fieldErrors) {
              const errorMsg = fieldErrors._errors[0];
              if (errorMsg) {
                newErrors[key as keyof EmployeeForm] = errorMsg;
              }
            }
          }
        });
        
        setErrors(newErrors);
        return;
      }
      
      // Format dates for storage
      const formattedEmployee: Employee = {
        id: Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        email: formData.email,
        jobTitle: formData.jobTitle,
        department: formData.department,
      };
      
      // Only add date properties if they exist
      if (formData.dateOfBirth instanceof Date) {
        formattedEmployee.dateOfBirth = formData.dateOfBirth.toISOString().split('T')[0];
      }
      
      if (formData.joiningDate instanceof Date) {
        formattedEmployee.joiningDate = formData.joiningDate.toISOString().split('T')[0];
      }
      
      // Add employee
      addEmployee(formattedEmployee);
      
      toast({
        title: "Success",
        description: "Employee added successfully!",
      });
      
      // Close sheet and reset form
      setIsSheetOpen(false);
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
      toast({
        title: "Error",
        description: "There was an error adding the employee.",
        variant: "destructive",
      });
    }
  };

  const openAddEmployeeSheet = () => {
    setIsSheetOpen(true);
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
            onClick={openAddEmployeeSheet}
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
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="sm:max-w-2xl w-full overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>
              {activeTab === 'manual' ? 'Add employee' : 'Match Columns'}
            </SheetTitle>
          </SheetHeader>
          
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
                      value={formData.gender}
                      onChange={(value) => handleSelectChange('gender', value)}
                      error={errors.gender}
                    />
                    
                    <FormDatePicker
                      id="dateOfBirth"
                      label="Date of Birth"
                      value={formData.dateOfBirth}
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
                      value={formData.joiningDate}
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
                      value={formData.department}
                      onChange={(value) => handleSelectChange('department', value)}
                      error={errors.department}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 mt-6 border-t">
                  <Button variant="outline" type="button" onClick={() => setIsSheetOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Employee
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
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <Button variant="link" className="text-brand">
                      Download sample CSV template
                    </Button>
                  </div>
                )}
                
                <div className="flex justify-end space-x-4 pt-6 mt-6 border-t">
                  <Button variant="outline" type="button" onClick={() => setIsSheetOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCsvSubmit} disabled={!csvFile}>
                    Import
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </OnboardingLayout>
  );
};

export default Employees;
