
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import OnboardingLayout from '@/components/OnboardingLayout';
import { useOnboarding, Role, Permission } from '@/context/OnboardingContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { FormField } from '@/components/Form/FormField';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, User, Users, FileText, Settings, Pencil, Eye, Trash2, Plus } from 'lucide-react';
import { z } from 'zod';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
});

type RoleForm = z.infer<typeof roleSchema>;

// Static permissions data grouped by category
const permissionGroups = [
  {
    group: 'Employee Management',
    icon: <Users className="h-5 w-5 text-indigo-500" />,
    permissions: [
      { id: 'view_employee', name: 'View employee directory' },
      { id: 'edit_employee', name: 'Edit employee details' },
      { id: 'add_employee', name: 'Add new employees' },
    ],
  },
  {
    group: 'Leave & Attendance',
    icon: <FileText className="h-5 w-5 text-emerald-500" />,
    permissions: [
      { id: 'view_leave', name: 'View leave calendar' },
      { id: 'approve_leave', name: 'Approve/reject leave requests' },
    ],
  },
  {
    group: 'System Administration',
    icon: <Settings className="h-5 w-5 text-blue-500" />,
    permissions: [
      { id: 'manage_roles', name: 'Manage roles and permissions' },
      { id: 'manage_settings', name: 'Manage system settings' },
    ],
  },
];

// Predefined roles with permissions for MVP
const predefinedRoles = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full access to all system features and settings',
    permissions: permissionGroups.flatMap(group => 
      group.permissions.map(p => ({
        id: p.id,
        name: p.name,
        group: group.group,
        isGranted: true,
      }))
    ),
  },
  {
    id: '2',
    name: 'HR Manager',
    description: 'Manages employee records and leave approvals',
    permissions: permissionGroups.flatMap(group => 
      group.permissions.map(p => ({
        id: p.id,
        name: p.name,
        group: group.group,
        isGranted: ['view_employee', 'edit_employee', 'add_employee', 'view_leave', 'approve_leave'].includes(p.id),
      }))
    ),
  },
  {
    id: '3',
    name: 'Employee',
    description: 'Basic access for regular employees',
    permissions: permissionGroups.flatMap(group => 
      group.permissions.map(p => ({
        id: p.id,
        name: p.name,
        group: group.group,
        isGranted: ['view_employee', 'view_leave'].includes(p.id),
      }))
    ),
  },
];

const Roles = () => {
  const navigate = useNavigate();
  const { roles, addRole, currentStep, nextStep } = useOnboarding();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleForm>({
    name: '',
    description: '',
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof RoleForm, string>>>({});

  // Use predefined roles if no roles exist yet
  const displayRoles = roles.length > 0 ? roles : predefinedRoles;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof RoleForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
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
      
      // If editing an existing role
      if (editingRole) {
        // In a real app, you'd update the role here
        console.log('Updating role:', { ...editingRole, ...formData, permissions });
      } else {
        // Add role
        addRole({
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description || '',
          permissions,
        });
      }
      
      // Close sheet and reset form
      closeSheet();
    } catch (error) {
      console.error('Error with role:', error);
    }
  };

  const openAddRoleSheet = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
    });
    setSelectedPermissions([]);
    setErrors({});
    setIsSheetOpen(true);
  };

  const openEditRoleSheet = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
    });
    setSelectedPermissions(role.permissions.filter(p => p.isGranted).map(p => p.id));
    setErrors({});
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
    });
    setSelectedPermissions([]);
    setErrors({});
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
      title="User Roles & Permissions"
      subtitle="Define who can access what in your organization"
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">User Roles</h2>
              <p className="text-sm text-gray-500 mt-1">
                Control access levels for different user types
              </p>
            </div>
            <Button 
              onClick={openAddRoleSheet}
              className="bg-brand hover:bg-brand/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">Role</TableHead>
                  <TableHead className="font-medium">Description</TableHead>
                  <TableHead className="font-medium">Access Level</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRoles.map((role) => {
                  // Count assigned permissions
                  const assignedCount = role.permissions.filter(p => p.isGranted).length;
                  const totalPermissions = role.permissions.length;
                  const accessLevel = 
                    assignedCount === totalPermissions ? "Full Access" :
                    assignedCount > totalPermissions / 2 ? "Standard Access" : "Limited Access";
                  
                  const badgeColor = 
                    assignedCount === totalPermissions ? "bg-green-100 text-green-800 border-green-200" :
                    assignedCount > totalPermissions / 2 ? "bg-blue-100 text-blue-800 border-blue-200" : 
                    "bg-amber-100 text-amber-800 border-amber-200";
                  
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
                        <div className="flex items-center">
                          <Badge variant="outline" className={`${badgeColor} border`}>
                            {accessLevel}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => openEditRoleSheet(role)}
                          >
                            <span className="sr-only">Edit</span>
                            <Pencil className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">View</span>
                            <Eye className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
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
            <SheetTitle className="text-xl">
              {editingRole ? 'Edit Role & Permissions' : 'Add New Role'}
            </SheetTitle>
            <SheetDescription>
              {editingRole 
                ? 'Modify role details and access permissions' 
                : 'Define a new role with specific permissions'}
            </SheetDescription>
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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Permissions</h3>
                <span className="text-xs text-gray-500">
                  {selectedPermissions.length} of {permissionGroups.flatMap(g => g.permissions).length} selected
                </span>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Accordion type="multiple" className="w-full">
                  {permissionGroups.map((group) => {
                    const groupPermissionIds = group.permissions.map(p => p.id);
                    const selectedGroupPermissions = selectedPermissions.filter(id => 
                      groupPermissionIds.includes(id)
                    );
                    const allSelected = selectedGroupPermissions.length === groupPermissionIds.length;
                    const someSelected = selectedGroupPermissions.length > 0 && !allSelected;
                    
                    return (
                      <AccordionItem key={group.group} value={group.group} className="border-b last:border-0">
                        <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:bg-gray-50">
                          <div className="flex items-center justify-between w-full pr-6">
                            <div className="flex items-center">
                              {group.icon}
                              <span className="ml-2">{group.group}</span>
                            </div>
                            <Badge variant="outline" className={`
                              ${allSelected ? 'bg-green-100 text-green-800 border-green-200' : 
                                 someSelected ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                                 'bg-gray-100 text-gray-800 border-gray-200'}
                            `}>
                              {selectedGroupPermissions.length}/{groupPermissionIds.length}
                            </Badge>
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
                                  className="text-brand focus:ring-brand h-4 w-4"
                                />
                                <Label htmlFor={permission.id} className="ml-3 text-sm text-gray-700">
                                  {permission.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-6 mt-6 border-t">
              <Button variant="outline" type="button" onClick={closeSheet}>
                Cancel
              </Button>
              <Button type="submit" className="bg-brand hover:bg-brand/90 text-white">
                {editingRole ? 'Update Role' : 'Save Role'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </OnboardingLayout>
  );
};

export default Roles;
