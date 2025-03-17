
import React from 'react';

interface FormErrorProps {
  message: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <p className="mt-1 text-sm text-red-500">
      {message}
    </p>
  );
};
