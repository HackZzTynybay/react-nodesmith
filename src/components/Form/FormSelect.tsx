
import React from 'react';
import { Label } from '@/components/ui/label';
import { FormError } from '@/components/Form/FormError';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps {
  id: string;
  label: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  id,
  label,
  options,
  placeholder = 'Select',
  required = false,
  error,
  disabled = false,
  value,
  onChange,
  onBlur,
}) => {
  return (
    <div className="mb-4">
      <Label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <Select
        disabled={disabled}
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger 
          id={id} 
          className={`w-full ${error ? 'border-red-500' : ''}`}
          onBlur={onBlur}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      
      {error && <FormError message={error} />}
    </div>
  );
};
