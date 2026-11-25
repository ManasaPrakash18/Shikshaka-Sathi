/**
 * Unified Input Format Validators for Karnataka CCE ERP
 * Enforces strict validation rules:
 * - Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
 * - Phone: exactly 10 digits
 * - Email / Gmail: standard email format
 * - Aadhaar: exactly 12 digits
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates password strength:
 * - Minimum length: 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 numerical character (0-9)
 * - At least 1 special character (!@#$%^&*...)
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long.',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter (A-Z).',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter (a-z).',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one numerical character (0-9).',
    };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one special character (e.g. !@#$%^&*).',
    };
  }

  return { isValid: true };
}

/**
 * Validates phone number:
 * - Must and should have exactly 10 digits
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required.' };
  }

  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  // Discard country code 91 if 12 digits provided
  const digitsOnly = cleanPhone.startsWith('91') && cleanPhone.length === 12
    ? cleanPhone.slice(2)
    : cleanPhone;

  if (!/^\d{10}$/.test(digitsOnly)) {
    return {
      isValid: false,
      error: 'Phone number must have exactly 10 numerical digits.',
    };
  }

  return { isValid: true };
}

/**
 * Validates email address format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email address is required.' };
  }

  const cleanEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      isValid: false,
      error: 'Please enter a valid official email address (e.g. name@school.edu.in).',
    };
  }

  return { isValid: true };
}

/**
 * Validates Aadhaar card number:
 * - Must have exactly 12 numerical digits
 */
export function validateAadhaar(aadhaar: string): ValidationResult {
  if (!aadhaar) {
    return { isValid: false, error: 'Aadhaar number is required.' };
  }

  const cleanAadhaar = aadhaar.replace(/[\s\-]/g, '');
  if (!/^\d{12}$/.test(cleanAadhaar)) {
    return {
      isValid: false,
      error: 'Aadhaar number must contain exactly 12 numerical digits.',
    };
  }

  return { isValid: true };
}
