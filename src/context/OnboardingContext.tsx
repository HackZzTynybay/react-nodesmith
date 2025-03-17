import React, { createContext, useContext, useState } from 'react';

interface OnboardingContextType {
  departments: Department[];
  roles: Role[];
  employees: Employee[];
  currentStep: number;
  isOnboardingComplete: boolean; // Added this property
  addDepartment: (department: Department) => void;
  removeDepartment: (id: string) => void;
  updateDepartment: (id: string, department: Partial<Department>) => void;
  addRole: (role: Role) => void;
  removeRole: (id: string) => void;
  updateRole: (id: string, role: Partial<Role>) => void;
  addEmployee: (employee: Employee) => void;
  removeEmployee: (id: string) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export interface Department {
  id: string;
  name: string;
  email?: string;
  lead?: string;
}

export interface Permission {
  id: string;
  name: string;
  group: string;
  isGranted: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  email: string;
  joiningDate?: string;
  jobTitle?: string;
  department?: string;
}

const OnboardingContext = createContext<OnboardingContextType>({} as OnboardingContextType);

export const useOnboarding = () => useContext(OnboardingContext);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Super Admin',
      description: 'A super admin has all permissions across the system.',
      permissions: [],
    },
    {
      id: '2',
      name: 'HR Manager',
      description: 'An HR Manager has access to manage all employee information except financial information.',
      permissions: [],
    },
    {
      id: '3',
      name: 'Department Manager',
      description: 'A Department Manager has permissions to approves team leave/attendance, views team reports.',
      permissions: [],
    },
    {
      id: '4',
      name: 'Employee',
      description: 'An Employee has the basic access to personal data, leave requests, and company policy viewing.',
      permissions: [],
    },
    {
      id: '5',
      name: 'Executive',
      description: 'An Executive has permissions to company-wide data access, financial oversight, and policy approvals.',
      permissions: [],
    },
    {
      id: '6',
      name: 'Finance Manager',
      description: 'An Finance Manger can process payroll, tracks budgets, approves expenses.',
      permissions: [],
    },
  ]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  // Add state for isOnboardingComplete
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(false);

  const addDepartment = (department: Department) => {
    setDepartments([...departments, department]);
  };

  const removeDepartment = (id: string) => {
    setDepartments(departments.filter(dept => dept.id !== id));
  };

  const updateDepartment = (id: string, department: Partial<Department>) => {
    setDepartments(departments.map(dept => dept.id === id ? { ...dept, ...department } : dept));
  };

  const addRole = (role: Role) => {
    setRoles([...roles, role]);
  };

  const removeRole = (id: string) => {
    setRoles(roles.filter(role => role.id !== id));
  };

  const updateRole = (id: string, role: Partial<Role>) => {
    setRoles(roles.map(r => r.id === id ? { ...r, ...role } : r));
  };

  const addEmployee = (employee: Employee) => {
    setEmployees([...employees, employee]);
  };

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const updateEmployee = (id: string, employee: Partial<Employee>) => {
    setEmployees(employees.map(emp => emp.id === id ? { ...emp, ...employee } : emp));
  };

  const nextStep = () => {
    if (currentStep === 3) {
      // Mark onboarding as complete when finishing the last step
      setIsOnboardingComplete(true);
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <OnboardingContext.Provider 
      value={{
        departments,
        roles,
        employees,
        currentStep,
        isOnboardingComplete,
        addDepartment,
        removeDepartment,
        updateDepartment,
        addRole,
        removeRole,
        updateRole,
        addEmployee,
        removeEmployee,
        updateEmployee,
        setCurrentStep,
        nextStep,
        prevStep,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
