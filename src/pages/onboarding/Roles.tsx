
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useOnboarding, Role, Permission } from '@/context/OnboardingContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FormField } from '@/components/Form/FormField';
import { FormSelect } from '@/components/Form/FormSelect';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Plus, Check } from 'lucide-react';
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
      { id: 'create_leave_policy', name: 'Create leave policies' },
      { id: 'view_attendance', name: 'View attendance logs' },
    ],
  },
  {
    group: 'Payroll & Finance',
    permissions: [
      { id: 'view_payroll', name: 'View payroll information' },
      { id: 'process_payroll', name: 'Process payroll' },
      { id: 'approve_expenses', name: 'Approve expense reports' },
      { id: 'view_finance', name: 'View financial reports' },
    ],
  },
  {
    group: 'System Administration',
    permissions: [
      { id: 'manage_roles', name: 'Manage roles and permissions' },
      { id: 'manage_settings', name: 'Manage system settings' },
      { id: 'manage_integrations', name: 'Manage integrations' },
      { id: 'view_audit_logs', name: 'View audit logs' },
    ],
  },
];

// Role templates with predefined permissions
const roleTemplates = {
  super_admin: permissionGroups.flatMap(group => group.permissions.map(p => p.id)),
  hr_manager: [
    'view_employee', 'edit_employee', 'add_employee', 
    'view_leave', 'approve_leave', 'create_leave_policy', 'view_attendance'
  ],
  dept_manager: [
    'view_employee', 'edit_employee',
    'view_leave', 'approve_leave', 'view_attendance'
  ],
  employee: [
    'view_employee', 'view_leave', 'view_attendance'
  ],
  executive: [
    'view_employee', 'view_leave', 'view_attendance', 
    'view_payroll', 'view_finance', 'approve_expenses'
  ],
  finance_manager: [
    'view_employee', 'view_payroll', 'process_payroll', 
    'approve_expenses', 'view_finance'
  ],
};

const Roles = () => {
  const navigate = useNavigate();
  const { roles, addRole, currentStep, nextStep } = useOnboarding();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [formData, setFormData] = useState<RoleForm>({
    name: '',
    description: '',
    useTemplate: true,
    templateId: '',
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof RoleForm, string>>>({});

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
    
    // Clear selected permissions when switching to template mode
    if (useTemplate && !formData.templateId) {
      setSelectedPermissions([]);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setFormData(prev => ({
      ...prev,
      templateId,
    }));
    
    // Apply template permissions
    if (templateId && roleTemplates[templateId as keyof typeof roleTemplates]) {
      setSelectedPermissions(roleTemplates[templateId as keyof typeof roleTemplates]);
    } else {
      setSelectedPermissions([]);
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
        const newErrors: Partial<Record<keyof RoleForm, string>> = {};
        
        // Extract and format errors
        Object.keys(formattedErrors).forEach(key => {
          if (key !== '_errors') {
            const fieldErrors = formattedErrors[key as keyof typeof formattedErrors];
            if (fieldErrors && 'string' !== typeof fieldErrors && '_errors' in fieldErrors) {
              const errorMsg = fieldErrors._errors[0];
              if (errorMsg) {
                newErrors[key as keyof RoleForm] = errorMsg;
              }
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
        description: formData.description || '',
        permissions,
      });
      
      // Close sheet and reset form
      setIsSheetOpen(false);
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

  const openAddRoleSheet = () => {
    setIsSheetOpen(true);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
          
          <button
            onClick={openAddRoleSheet}
            className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <Plus className="h-6 w-6 text-gray-400" />
            <span className="mt-2 text-sm font-medium text-gray-500">Add New Role</span>
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
        <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>Add Role</SheetTitle>
          </SheetHeader>
          
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
                  placeholder="Select a template"
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

const RoleCard: React.FC<{ role: Role }> = ({ role }) => {
  // Count assigned permissions
  const assignedCount = role.permissions.filter(p => p.isGranted).length;
  const totalCount = role.permissions.length || 0;
  
  // Group permissions by category for display
  const permissionsByGroup: Record<string, Permission[]> = {};
  role.permissions.forEach(permission => {
    if (permission.isGranted) {
      if (!permissionsByGroup[permission.group]) {
        permissionsByGroup[permission.group] = [];
      }
      permissionsByGroup[permission.group].push(permission);
    }
  });
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow transition-shadow">
      <h3 className="font-medium text-gray-900">{role.name}</h3>
      {role.description && (
        <p className="text-sm text-gray-500 mt-1">{role.description}</p>
      )}
      
      <div className="mt-3">
        {assignedCount > 0 ? (
          <p className="text-xs font-medium text-brand flex items-center">
            <Check className="h-3 w-3 mr-1" /> 
            {assignedCount} permission{assignedCount !== 1 ? 's' : ''} assigned
          </p>
        ) : (
          <p className="text-xs text-gray-500">No permissions assigned</p>
        )}
      </div>
      
      {assignedCount > 0 && Object.keys(permissionsByGroup).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="permissions">
              <AccordionTrigger className="text-xs font-medium py-1">
                View permissions
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-xs">
                  {Object.entries(permissionsByGroup).map(([group, permissions]) => (
                    <div key={group}>
                      <p className="font-medium text-gray-700">{group}</p>
                      <ul className="mt-1 ml-4 list-disc text-gray-600">
                        {permissions.map(permission => (
                          <li key={permission.id}>{permission.name}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default Roles;
