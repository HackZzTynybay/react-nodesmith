
import React from 'react';
import Logo from './Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4">
      <div className="w-full mb-6">
        <Logo />
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8 space-y-6">
          {(title || subtitle) && (
            <div className="text-center mb-6">
              {title && <h1 className="text-2xl font-semibold mb-1">{title}</h1>}
              {subtitle && <p className="text-gray-600">{subtitle}</p>}
            </div>
          )}
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
