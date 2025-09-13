import { VALIDATION } from './constants.js';

/**
 * Validation utility functions
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  return VALIDATION.EMAIL_REGEX.test(email);
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export function validatePassword(password) {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`,
    };
  }

  return { isValid: true, message: '' };
}

/**
 * Validates name format
 * @param {string} name - Name to validate
 * @returns {Object} Validation result with isValid and message
 */
export function validateName(name) {
  if (!name) {
    return { isValid: false, message: 'Name is required' };
  }

  if (name.trim().length < VALIDATION.NAME_MIN_LENGTH) {
    return {
      isValid: false,
      message: `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters long`,
    };
  }

  return { isValid: true, message: '' };
}

/**
 * Validates form data
 * @param {Object} formData - Form data to validate
 * @param {Array} fields - Fields to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateForm(formData, fields = []) {
  const errors = {};
  let isValid = true;

  fields.forEach(field => {
    const { name, type, required = false } = field;
    const value = formData[name];

    if (required && !value) {
      errors[name] = `${name} is required`;
      isValid = false;
      return;
    }

    if (value) {
      switch (type) {
        case 'email':
          if (!isValidEmail(value)) {
            errors[name] = 'Please enter a valid email address';
            isValid = false;
          }
          break;
        case 'password': {
          const passwordValidation = validatePassword(value);
          if (!passwordValidation.isValid) {
            errors[name] = passwordValidation.message;
            isValid = false;
          }
          break;
        }
        case 'name': {
          const nameValidation = validateName(value);
          if (!nameValidation.isValid) {
            errors[name] = nameValidation.message;
            isValid = false;
          }
          break;
        }
        default:
          break;
      }
    }
  });

  return { isValid, errors };
}
