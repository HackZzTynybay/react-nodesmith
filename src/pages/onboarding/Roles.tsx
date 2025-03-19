
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
import { Plus, Check, Shield, User, Users, FileText, Settings, ChevronRight } from 'lucide-react';
import { z } from 'zod';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
    icon: <Users className="h-5 w-5 text-indigo-500" />,
    permissions: [
      { id: 'view_employee', name: 'View employee directory' },
      { id: 'edit_employee', name: 'Edit employee details' },
      { id: 'add_employee', name: 'Add new employees' },
      { id: 'delete_employee', name: 'Delete/archive employees' },
    ],
  },
  {
    group: 'Leave & Attendance',
    icon: <FileText className="h-5 w-5 text-emerald-500" />,
    permissions: [
      { id: 'view_leave', name: 'View leave calendar' },
      { id: 'approve_leave', name: 'Approve/reject leave requests' },
      { id: 'create_leave_policy', name: 'Create leave policies' },
      { id: 'view_attendance', name: 'View attendance logs' },
    ],
  },
  {
    group: 'Payroll & Finance',
    icon: <FileText className="h-5 w-5 text-amber-500" />,
    permissions: [
      { id: 'view_payroll', name: 'View payroll information' },
      { id: 'process_payroll', name: 'Process payroll' },
      { id: 'approve_expenses', name: 'Approve expense reports' },
      { id: 'view_finance', name: 'View financial reports' },
    ],
  },
  {
    group: 'System Administration',
    icon: <Settings className="h-5 w-5 text-blue-500" />,
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
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">User Roles</h2>
              <p className="text-sm text-gray-500 mt-1">
                Define who can access what in your organization
              </p>
            </div>
            <Button 
              onClick={openAddRoleSheet}
              className="bg-brand hover:bg-brand/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Role
            </Button>
          </div>

          {roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <Shield className="h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">No roles defined yet</h3>
              <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
                Get started by adding your first role to define what users can access in your organization.
              </p>
              <Button 
                onClick={openAddRoleSheet}
                className="bg-brand hover:bg-brand/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Role
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-medium">Role</TableHead>
                    <TableHead className="font-medium">Description</TableHead>
                    <TableHead className="font-medium">Permissions</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => {
                    // Count assigned permissions
                    const assignedCount = role.permissions.filter(p => p.isGranted).length;
                    
                    return (
                      <TableRow key={role.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <User className="h-5 w-5 text-brand mr-2" />
                            {role.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 max-w-[300px] truncate">
                          {role.description || "—"}
                        </TableCell>
                        <TableCell>
                          {assignedCount > 0 ? (
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand/10 text-brand">
                                <Check className="h-3 w-3 mr-1" /> 
                                {assignedCount} permission{assignedCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">No permissions</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-brand">
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-4 mt-8">
          <Button variant="outline" onClick={handleSkip}>
            Skip
          </Button>
          <Button 
            className="bg-brand hover:bg-brand/90 text-white" 
            onClick={handleNext}
          >
            Save & Next
          </Button>
        </div>
      </div>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="text-xl">Define Role & Permissions</SheetTitle>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <FormField
              id="name"
              label="Role Name"
              placeholder="E.g., HR Manager, Team Lead"
              required
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />
            
            <FormField
              id="description"
              label="Description"
              placeholder="Brief description of this role's responsibilities"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
            />
            
            <div className="space-y-4 mt-6">
              <h3 className="text-sm font-medium text-gray-700">Permissions</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="useTemplate"
                    name="permissionType"
                    className="h-4 w-4 text-brand focus:ring-brand border-gray-300"
                    checked={formData.useTemplate}
                    onChange={() => handleTemplateToggle(true)}
                  />
                  <Label htmlFor="useTemplate" className="ml-2 text-sm font-medium text-gray-700">
                    Use permission template
                  </Label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="customPerms"
                    name="permissionType"
                    className="h-4 w-4 text-brand focus:ring-brand border-gray-300"
                    checked={!formData.useTemplate}
                    onChange={() => handleTemplateToggle(false)}
                  />
                  <Label htmlFor="customPerms" className="ml-2 text-sm font-medium text-gray-700">
                    Custom permissions
                  </Label>
                </div>
              </div>
              
              {formData.useTemplate ? (
                <FormSelect
                  id="templateId"
                  label="Select template"
                  placeholder="Choose a template"
                  options={[
                    { value: 'super_admin', label: 'Super Administrator' },
                    { value: 'hr_manager', label: 'HR Manager' },
                    { value: 'dept_manager', label: 'Department Manager' },
                    { value: 'employee', label: 'Standard Employee' },
                    { value: 'executive', label: 'Executive' },
                    { value: 'finance_manager', label: 'Finance Manager' },
                  ]}
                  value={formData.templateId}
                  onChange={(value) => handleTemplateSelect(value)}
                  error={errors.templateId}
                />
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Select the specific permissions for this role:
                  </p>
                  
                  <div className="border rounded-md overflow-hidden">
                    <Accordion type="multiple" className="w-full">
                      {permissionGroups.map((group) => (
                        <AccordionItem key={group.group} value={group.group} className="border-b last:border-0">
                          <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:bg-gray-50">
                            <div className="flex items-center">
                              {group.icon}
                              <span className="ml-2">{group.group}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3 pt-1">
                            <div className="space-y-2">
                              {group.permissions.map((permission) => (
                                <div key={permission.id} className="flex items-center py-1">
                                  <Checkbox
                                    id={permission.id}
                                    checked={selectedPermissions.includes(permission.id)}
                                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                                    className="text-brand focus:ring-brand"
                                  />
                                  <Label htmlFor={permission.id} className="ml-3 text-sm text-gray-700">
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
              <Button type="submit" className="bg-brand hover:bg-brand/90 text-white">
                Save Role
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </OnboardingLayout>
  );
};

export default Roles;
