
import React, { createContext, useContext, useState } from 'react';

interface OnboardingContextType {
  departments: Department[];
  roles: Role[];
  employees: Employee[];
  currentStep: number;
  isOnboardingComplete: boolean;
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
  // Populate with sample departments
  const [departments, setDepartments] = useState<Department[]>([
    {
      id: '1',
      name: 'Engineering',
      email: 'engineering@example.com',
      lead: 'John Smith',
    },
    {
      id: '2',
      name: 'Marketing',
      email: 'marketing@example.com',
      lead: 'Sarah Johnson',
    },
    {
      id: '3',
      name: 'Human Resources',
      email: 'hr@example.com',
      lead: 'David Lee',
    },
    {
      id: '4',
      name: 'Finance',
      email: 'finance@example.com',
      lead: 'Michelle Wong',
    },
    {
      id: '5',
      name: 'Sales',
      email: 'sales@example.com',
      lead: 'Robert Chen',
    },
  ]);
  
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
  
  // Populate with sample employees
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      gender: 'Male',
      dateOfBirth: '1990-05-15',
      email: 'john.doe@example.com',
      joiningDate: '2022-01-10',
      jobTitle: 'Software Engineer',
      department: 'Engineering',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      gender: 'Female',
      dateOfBirth: '1992-08-22',
      email: 'jane.smith@example.com',
      joiningDate: '2021-11-15',
      jobTitle: 'Marketing Specialist',
      department: 'Marketing',
    },
    {
      id: '3',
      firstName: 'Michael',
      lastName: 'Johnson',
      gender: 'Male',
      dateOfBirth: '1985-03-30',
      email: 'michael.johnson@example.com',
      joiningDate: '2020-06-01',
      jobTitle: 'HR Manager',
      department: 'Human Resources',
    },
    {
      id: '4',
      firstName: 'Emily',
      lastName: 'Williams',
      gender: 'Female',
      dateOfBirth: '1988-11-12',
      email: 'emily.williams@example.com',
      joiningDate: '2022-02-15',
      jobTitle: 'Financial Analyst',
      department: 'Finance',
    },
    {
      id: '5',
      firstName: 'David',
      lastName: 'Brown',
      gender: 'Male',
      dateOfBirth: '1991-07-08',
      email: 'david.brown@example.com',
      joiningDate: '2021-09-20',
      jobTitle: 'Sales Representative',
      department: 'Sales',
    },
  ]);
  
  const [currentStep, setCurrentStep] = useState<number>(1);
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
