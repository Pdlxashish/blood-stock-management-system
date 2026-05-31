'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { validatePassword, getPasswordStrength } from '@/lib/validators';

interface PasswordInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  showStrengthIndicator?: boolean;
  showRequirements?: boolean;
  className?: string;
}

export default function PasswordInput({
  id = 'password',
  name = 'password',
  value,
  onChange,
  placeholder = '••••••••',
  label = 'Password',
  required = false,
  disabled = false,
  showStrengthIndicator = true,
  showRequirements = true,
  className = '',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const validation = validatePassword(value);
  const strength = value ? getPasswordStrength(value) : null;

  const requirements = [
    { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { label: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'One number', test: (pwd: string) => /[0-9]/.test(pwd) },
    { label: 'One special character', test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
  ];

  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-blue-500';
      case 'very-strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthWidth = (score: number) => {
    return `${(score / 6) * 100}%`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={id} className="text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="pl-10 pr-10 h-11"
          required={required}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          disabled={disabled}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Password Strength Indicator */}
      {showStrengthIndicator && value && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Password strength:</span>
            <span className={`font-medium ${
              strength?.level === 'weak' ? 'text-red-600' :
              strength?.level === 'medium' ? 'text-yellow-600' :
              strength?.level === 'strong' ? 'text-blue-600' :
              'text-green-600'
            }`}>
              {strength?.feedback}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${strength ? getStrengthColor(strength.level) : 'bg-gray-300'}`}
              style={{ width: strength ? getStrengthWidth(strength.score) : '0%' }}
            />
          </div>
        </div>
      )}

      {/* Password Requirements */}
      {showRequirements && (isFocused || value) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1.5">
          <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
          {requirements.map((req, index) => {
            const isValid = value && req.test(value);
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                {isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                <span className={isValid ? 'text-green-700' : 'text-gray-600'}>
                  {req.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
