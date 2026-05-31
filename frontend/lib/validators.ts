/**
 * Frontend validation utilities for user input
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Password validation
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return {
      isValid: false,
      message: 'Password is required',
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)',
    };
  }

  return { isValid: true };
};

/**
 * Get password strength level
 */
export const getPasswordStrength = (password: string): {
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  feedback: string;
} => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  if (score <= 2) {
    return { level: 'weak', score, feedback: 'Weak password' };
  } else if (score <= 4) {
    return { level: 'medium', score, feedback: 'Medium strength' };
  } else if (score <= 5) {
    return { level: 'strong', score, feedback: 'Strong password' };
  } else {
    return { level: 'very-strong', score, feedback: 'Very strong password' };
  }
};

/**
 * Mobile number validation
 * - Must contain only digits
 * - Must be exactly 10 digits
 * - Should start with 9, 8, 7, or 6
 */
export const validateMobileNumber = (phone: string): ValidationResult => {
  if (!phone) {
    return {
      isValid: false,
      message: 'Phone number is required',
    };
  }

  // Remove any whitespace or special characters
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Check if it contains only digits
  if (!/^\d+$/.test(cleanPhone)) {
    return {
      isValid: false,
      message: 'Phone number must contain only digits',
    };
  }

  // Check if it's exactly 10 digits
  if (cleanPhone.length !== 10) {
    return {
      isValid: false,
      message: 'Phone number must be exactly 10 digits',
    };
  }

  // Check if it starts with 9, 8, 7, or 6
  const firstDigit = cleanPhone.charAt(0);
  if (!['9', '8', '7', '6'].includes(firstDigit)) {
    return {
      isValid: false,
      message: 'Phone number must start with 9, 8, 7, or 6',
    };
  }

  return { isValid: true };
};

/**
 * Email validation
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return {
      isValid: false,
      message: 'Email is required',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address',
    };
  }

  return { isValid: true };
};

/**
 * Name validation
 */
export const validateName = (name: string): ValidationResult => {
  if (!name) {
    return {
      isValid: false,
      message: 'Name is required',
    };
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      message: 'Name must be at least 2 characters long',
    };
  }

  if (name.trim().length > 100) {
    return {
      isValid: false,
      message: 'Name must not exceed 100 characters',
    };
  }

  return { isValid: true };
};

/**
 * Validate all registration fields
 */
export const validateRegistrationData = (data: {
  name: string;
  email: string;
  password: string;
  phone: string;
}): ValidationResult => {
  // Validate name
  const nameValidation = validateName(data.name);
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  // Validate phone
  const phoneValidation = validateMobileNumber(data.phone);
  if (!phoneValidation.isValid) {
    return phoneValidation;
  }

  return { isValid: true };
};

/**
 * Validate login fields
 */
export const validateLoginData = (data: {
  email: string;
  password: string;
}): ValidationResult => {
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  // Password is required but we don't validate format on login
  if (!data.password) {
    return {
      isValid: false,
      message: 'Password is required',
    };
  }

  return { isValid: true };
};

/**
 * Format phone number for display (e.g., 9876543210 -> 987-654-3210)
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  if (cleanPhone.length === 10) {
    return `${cleanPhone.slice(0, 3)}-${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
  }
  return phone;
};

/**
 * Clean phone number (remove formatting)
 */
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[\s\-\(\)]/g, '');
};
