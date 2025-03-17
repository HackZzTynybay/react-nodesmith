
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/Form/FormError';

interface FormCheckboxProps {
  id: string;
  label: React.ReactNode;
  error?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  id,
  label,
  error,
  disabled = false,
  checked = false,
  onChange,
  onBlur,
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          onBlur={onBlur}
        />
        <Label 
          htmlFor={id}
          className="text-sm font-medium text-gray-700 cursor-pointer"
        >
          {label}
        </Label>
      </div>
      
      {error && <FormError message={error} />}
    </div>
  );
};
