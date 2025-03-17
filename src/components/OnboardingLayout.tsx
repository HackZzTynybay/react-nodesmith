
import React from 'react';
import Logo from './Logo';
import { useOnboarding } from '@/context/OnboardingContext';
import { Check } from 'lucide-react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ 
  children, 
  title, 
  subtitle 
}) => {
  const { currentStep } = useOnboarding();
  
  const steps = [
    { name: 'Departments', step: 1 },
    { name: 'Roles and Permissions', step: 2 },
    { name: 'Employees', step: 3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-72 bg-white border-r">
        <div className="p-6">
          <Logo />
        </div>
        
        <div className="mt-6">
          {steps.map((step, index) => (
            <div key={step.name} className="relative">
              {index > 0 && (
                <div 
                  className={`absolute left-6 top-0 -ml-px w-0.5 h-10 ${
                    currentStep > index ? 'bg-brand' : 'bg-gray-200'
                  }`} 
                  aria-hidden="true"
                />
              )}
              
              <div className="relative flex items-center px-6 py-5">
                <span 
                  className={`flex items-center justify-center h-9 w-9 rounded-full border-2 ${
                    currentStep > step.step 
                      ? 'bg-brand border-brand' 
                      : currentStep === step.step 
                      ? 'border-brand' 
                      : 'border-gray-300'
                  } flex-shrink-0`}
                >
                  {currentStep > step.step ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span className={`text-sm font-medium ${currentStep === step.step ? 'text-brand' : 'text-gray-500'}`}>
                      {index + 1}
                    </span>
                  )}
                </span>
                <span className="ml-4 text-sm font-medium text-gray-900">{step.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1">
        <div className="max-w-4xl mx-auto py-10 px-6">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
