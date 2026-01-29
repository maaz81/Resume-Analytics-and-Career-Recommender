/**
 * Authentication Validation Utilities
 * Form validation rules for login and signup
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return null;
};

/**
 * Validate password
 */
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  return null;
};

/**
 * Validate password strength
 */
export const getPasswordStrength = (password) => {
  if (!password) return { strength: 'weak', score: 0 };

  let score = 0;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Complexity checks
  if (/[a-z]/.test(password)) score++; // lowercase
  if (/[A-Z]/.test(password)) score++; // uppercase
  if (/[0-9]/.test(password)) score++; // numbers
  if (/[^a-zA-Z0-9]/.test(password)) score++; // special chars

  // Determine strength
  if (score <= 2) return { strength: 'weak', score, color: 'error' };
  if (score <= 4) return { strength: 'medium', score, color: 'warning' };
  return { strength: 'strong', score, color: 'success' };
};

/**
 * Validate confirm password
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return null;
};

/**
 * Validate name
 */
export const validateName = (name) => {
  if (!name) {
    return 'Name is required';
  }

  if (name.length < 2) {
    return 'Name must be at least 2 characters long';
  }

  if (name.length > 50) {
    return 'Name must be less than 50 characters';
  }

  return null;
};

/**
 * Validate login form
 */
export const validateLoginForm = (values) => {
  const errors = {};

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;

  return errors;
};

/**
 * Validate signup form
 */
export const validateSignupForm = (values) => {
  const errors = {};

  const nameError = validateName(values.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;

  const confirmPasswordError = validateConfirmPassword(
    values.password,
    values.confirmPassword
  );
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  return errors;
};