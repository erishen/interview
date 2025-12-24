export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
}

// Extended validation functions (project-specific)
export function isPhoneNumber(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

export function isValidPassword(password: string): boolean {
  // Project-specific password rule: at least 8 chars, contains letter and number
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function isValidUsername(username: string): boolean {
  // 3-20 chars, alphanumeric and underscore, cannot start with number
  const usernameRegex = /^[a-zA-Z_][a-zA-Z0-9_]{2,19}$/;
  return usernameRegex.test(username);
}

export function isValidFilename(filename: string): boolean {
  // No special chars, reasonable length
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  return !invalidChars.test(filename) && filename.length > 0 && filename.length <= 255;
}