/**
 * Form validation rules
 */
export const rules = {
  required: (value) => (value ? null : 'This field is required'),
  email: (value) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
      ? null
      : 'Invalid email address',
  phone: (value) =>
    /^[0-9]{10,13}$/.test(value) ? null : 'Invalid phone number',
  minLength: (length) => (value) =>
    value.length >= length ? null : `Must be at least ${length} characters`,
  maxLength: (length) => (value) =>
    value.length <= length ? null : `Must be at most ${length} characters`,
  number: (value) =>
    !isNaN(value) && !isNaN(parseFloat(value)) ? null : 'Must be a number',
  price: (value) =>
    /^\d+(\.\d{1,2})?$/.test(value) ? null : 'Invalid price format',
  url: (value) =>
    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value)
      ? null
      : 'Invalid URL',
  password: (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(value)
      ? null
      : 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number',
  confirmPassword: (password) => (value) =>
    value === password ? null : 'Passwords do not match',
};

/**
 * Validate a single field
 */
export function validateField(value, validations = []) {
  for (const validation of validations) {
    const error = validation(value);
    if (error) return error;
  }
  return null;
}

/**
 * Validate all form fields
 */
export function validateForm(values, validationRules) {
  const errors = {};
  Object.keys(validationRules).forEach((key) => {
    const error = validateField(values[key], validationRules[key]);
    if (error) errors[key] = error;
  });
  return errors;
}

/**
 * Format price input
 */
export function formatPrice(value) {
  // Remove non-numeric characters
  const number = value.replace(/[^\d]/g, '');
  
  // Convert to number and format with 2 decimal places
  const formatted = (Number(number) / 100).toFixed(2);
  
  // Add thousand separators
  return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Parse price input
 */
export function parsePrice(value) {
  // Remove thousand separators and convert to number
  return Number(value.replace(/,/g, ''));
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(file, allowedTypes) {
  return allowedTypes.includes(file.type);
}

/**
 * Check if file size is within limit
 */
export function isAllowedFileSize(file, maxSize) {
  return file.size <= maxSize;
}

/**
 * Create form data from object
 */
export function createFormData(data, files = {}) {
  const formData = new FormData();
  
  // Add regular fields
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });
  
  // Add files
  Object.keys(files).forEach(key => {
    if (files[key]) {
      formData.append(key, files[key]);
    }
  });
  
  return formData;
}

/**
 * Handle form errors from API response
 */
export function handleFormErrors(error) {
  if (error.response?.data?.errors) {
    // Laravel validation errors
    return Object.keys(error.response.data.errors).reduce((acc, key) => {
      acc[key] = error.response.data.errors[key][0];
      return acc;
    }, {});
  }
  
  return {
    _error: error.response?.data?.message || error.message || 'Something went wrong',
  };
}

/**
 * Reset form fields
 */
export function resetForm(formRef) {
  if (formRef.current) {
    formRef.current.reset();
    // Clear any custom form elements (file inputs, etc.)
    const fileInputs = formRef.current.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
      input.value = '';
    });
  }
}

/**
 * Serialize form data to object
 */
export function serializeForm(formElement) {
  const formData = new FormData(formElement);
  const data = {};
  
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }
  
  return data;
}

/**
 * Format date for form inputs
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format time for form inputs
 */
export function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
