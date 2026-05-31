'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { validateMobileNumber, cleanPhoneNumber } from '@/lib/validators';

interface PhoneInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  showValidation?: boolean;
  className?: string;
}

export default function PhoneInput({
  id = 'phone',
  name = 'phone',
  value,
  onChange,
  onBlur,
  placeholder = '9876543210',
  label = 'Phone Number',
  required = false,
  disabled = false,
  showValidation = true,
  className = '',
}: PhoneInputProps) {
  const [touched, setTouched] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    if (touched && value) {
      const validation = validateMobileNumber(value);
      setValidationMessage(validation.isValid ? '' : validation.message || '');
    } else {
      setValidationMessage('');
    }
  }, [value, touched]);

  const handleBlur = () => {
    setTouched(true);
    if (onBlur) {
      onBlur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const cleaned = e.target.value.replace(/\D/g, '');
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    
    // Create a new event with the cleaned value
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value: limited,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(newEvent);
  };

  const validation = validateMobileNumber(value);
  const isValid = validation.isValid;
  const showSuccess = touched && value && isValid;
  const showError = touched && value && !isValid;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={id} className="text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          id={id}
          name={name}
          type="tel"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`pl-10 pr-10 h-11 ${
            showError ? 'border-red-500 focus:ring-red-500' : 
            showSuccess ? 'border-green-500 focus:ring-green-500' : ''
          }`}
          required={required}
          disabled={disabled}
          maxLength={10}
        />
        {showValidation && (
          <div className="absolute right-3 top-3">
            {showSuccess && (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
            {showError && (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
        )}
      </div>

      {/* Validation Message */}
      {showValidation && showError && validationMessage && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {validationMessage}
        </p>
      )}

      {/* Helper Text */}
      {showValidation && !touched && (
        <p className="text-xs text-gray-500">
          Enter 10-digit mobile number starting with 9, 8, 7, or 6
        </p>
      )}

      {/* Success Message */}
      {showValidation && showSuccess && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Valid phone number
        </p>
      )}
    </div>
  );
}
