
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useOnboarding, Role, Permission } from '@/context/OnboardingContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormField } from '@/components/Form/FormField';
import { FormSelect } from '@/components/Form/FormSelect';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Plus, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { z } from 'zod';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  useTemplate: z.boolean().optional(),
  templateId: z.string().optional(),
});

type RoleForm = z.infer<typeof roleSchema>;

// Sample permissions grouped by category
const permissionGroups = [
  {
    group: 'Employee Management',
    permissions: [
      { id: 'view_employee', name: 'View employee directory' },
      { id: 'edit_employee', name: 'Edit employee details' },
      { id: 'add_employee', name: 'Add new employees' },
      { id: 'delete_employee', name: 'Delete/archive employees' },
    ],
  },
  {
    group: 'Leave & Attendance',
    permissions: [
      { id: 'view_leave', name: 'View leave calendar' },
      { id: 'approve_leave', name: 'Approve/reject leave requests' },
      { id: 'create_leave_policy', name: 'Create leave policies (casual/sick/maternity)' },
      { id: 'view_attendance', name: 'View attendance logs' },
    ],
  },
];

const Roles = () => {
  const navigate = useNavigate();
  const { roles, addRole, currentStep, nextStep } = useOnboarding();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<RoleForm>({
    name: '',
    description: '',
    useTemplate: true,
    templateId: '',
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<RoleForm>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof RoleForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTemplateToggle = (useTemplate: boolean) => {
    setFormData(prev => ({
      ...prev,
      useTemplate,
      templateId: useTemplate ? prev.templateId : '',
    }));
  };

  const handleTemplateSelect = (templateId: string) => {
    setFormData(prev => ({
      ...prev,
      templateId,
    }));
    
    // Simulate loading template permissions
    // In a real app, this would come from the backend
    if (templateId) {
      const allPermissions = permissionGroups.flatMap(group => 
        group.permissions.map(perm => perm.id)
      );
      setSelectedPermissions(allPermissions);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const result = roleSchema.safeParse(formData);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        const newErrors: Partial<RoleForm> = {};
        
        // Extract and format errors
        Object.keys(formattedErrors).forEach(key => {
          if (key !== '_errors') {
            const errorMsg = formattedErrors[key as keyof typeof formattedErrors]?._errors[0];
            if (errorMsg) {
              newErrors[key as keyof RoleForm] = errorMsg;
            }
          }
        });
        
        setErrors(newErrors);
        return;
      }
      
      // Create permissions array
      const permissions: Permission[] = permissionGroups.flatMap(group => 
        group.permissions.map(perm => ({
          id: perm.id,
          name: perm.name,
          group: group.group,
          isGranted: selectedPermissions.includes(perm.id),
        }))
      );
      
      // Add role
      addRole({
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        permissions,
      });
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        useTemplate: true,
        templateId: '',
      });
      setSelectedPermissions([]);
      setErrors({});
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  const openAddRoleDialog = () => {
    setIsDialogOpen(true);
  };

  const handleNext = () => {
    nextStep();
    navigate('/onboarding/employees');
  };

  const handleSkip = () => {
    nextStep();
    navigate('/onboarding/employees');
  };

  return (
    <OnboardingLayout
      title="Set Up User Roles & Permissions"
      subtitle="Configure roles and assign permissions to control access levels."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
          
          <button
            onClick={openAddRoleDialog}
            className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <Plus className="h-6 w-6 text-gray-400" />
            <span className="mt-2 text-sm font-medium text-gray-500">Role</span>
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
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <FormField
              id="name"
              label="Role Name"
              placeholder="Enter role name"
              required
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />
            
            <FormField
              id="description"
              label="Description"
              placeholder="Enter description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
            />
            
            <div className="space-y-4 mt-6">
              <h3 className="text-sm font-medium">Permissions</h3>
              
              <div className="flex space-x-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="useTemplate"
                    name="permissionType"
                    className="h-4 w-4 text-brand"
                    checked={formData.useTemplate}
                    onChange={() => handleTemplateToggle(true)}
                  />
                  <Label htmlFor="useTemplate" className="ml-2 text-sm">
                    Existing permission template
                  </Label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="customPerms"
                    name="permissionType"
                    className="h-4 w-4 text-brand"
                    checked={!formData.useTemplate}
                    onChange={() => handleTemplateToggle(false)}
                  />
                  <Label htmlFor="customPerms" className="ml-2 text-sm">
                    Choose your own set of permissions
                  </Label>
                </div>
              </div>
              
              {formData.useTemplate ? (
                <FormSelect
                  id="templateId"
                  label="Existing permission template"
                  placeholder="Select"
                  options={[
                    { value: 'super_admin', label: 'Super Admin' },
                    { value: 'hr_manager', label: 'HR Manager' },
                    { value: 'dept_manager', label: 'Department Manager' },
                    { value: 'employee', label: 'Employee' },
                    { value: 'executive', label: 'Executive' },
                    { value: 'finance_manager', label: 'Finance Manager' },
                  ]}
                  value={formData.templateId}
                  onChange={(value) => handleTemplateSelect(value)}
                  error={errors.templateId}
                />
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Select the permissions for this role:</p>
                  
                  <div className="border rounded-md">
                    <Accordion type="multiple" className="w-full">
                      {permissionGroups.map((group) => (
                        <AccordionItem key={group.group} value={group.group}>
                          <AccordionTrigger className="px-4 text-sm font-medium">
                            {group.group}
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-2">
                            <div className="space-y-2">
                              {group.permissions.map((permission) => (
                                <div key={permission.id} className="flex items-center">
                                  <Checkbox
                                    id={permission.id}
                                    checked={selectedPermissions.includes(permission.id)}
                                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                                  />
                                  <Label htmlFor={permission.id} className="ml-2 text-sm">
                                    {permission.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </OnboardingLayout>
  );
};

const RoleCard: React.FC<{ role: Role }> = ({ role }) => {
  // Count assigned permissions
  const assignedCount = role.permissions.filter(p => p.isGranted).length;
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="font-medium text-gray-900">{role.name}</h3>
      {role.description && (
        <p className="text-sm text-gray-500 mt-1">{role.description}</p>
      )}
      <p className="text-xs text-brand mt-2">
        {assignedCount > 0 
          ? `${assignedCount} permissions assigned` 
          : 'All permissions assigned'}
      </p>
    </div>
  );
};

export default Roles;
