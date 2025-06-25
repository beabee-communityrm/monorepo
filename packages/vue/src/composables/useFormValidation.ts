/**
 * Composable for consistent form validation patterns across Vue components
 * Provides unified validation logic, error handling, and state management
 */
import useVuelidate from '@vuelidate/core';
import type { ValidationArgs, ValidationRuleWithParams } from '@vuelidate/core';
import { type ComputedRef, type Ref, computed, ref, watch } from 'vue';

/**
 * Validation rules configuration
 */
export type ValidationRules = Record<string, ValidationRuleWithParams>;

/**
 * Form validation state
 */
export interface FormValidationState {
  /** Whether the field has been touched */
  isTouched: boolean;
  /** Whether the field is currently being validated */
  isValidating: boolean;
  /** Whether the field has validation errors */
  hasError: boolean;
  /** Whether the field is valid */
  isValid: boolean;
  /** Current error message */
  errorMessage: string;
  /** All error messages */
  errorMessages: string[];
}

/**
 * Options for form validation
 */
export interface UseFormValidationOptions {
  /** Whether to validate on blur */
  validateOnBlur?: boolean;
  /** Whether to validate on input change */
  validateOnChange?: boolean;
  /** Whether to validate immediately */
  validateOnMount?: boolean;
  /** Custom error message formatter */
  formatErrorMessage?: (error: any) => string;
}

/**
 * Provides form validation utilities using Vuelidate
 * @param value - Reactive value to validate
 * @param rules - Validation rules configuration
 * @param options - Validation options
 * @returns Form validation utilities and state
 *
 * @example
 * const email = ref('');
 * const { validation, hasError, errorMessage, touch, reset } = useFormValidation(
 *   email,
 *   computed(() => ({
 *     email: { required, email }
 *   }))
 * );
 */
export function useFormValidation<T>(
  value: Ref<T>,
  rules: ComputedRef<ValidationRules>,
  options: UseFormValidationOptions = {}
) {
  const {
    validateOnBlur = true,
    validateOnChange = true,
    validateOnMount = false,
    formatErrorMessage = (error: any) => error.$message || 'Invalid value',
  } = options;

  // Create validation instance
  const validationData = computed(() => ({ value: value.value }));
  const validation = useVuelidate(rules, validationData, {
    $autoDirty: validateOnChange,
  });

  // Computed validation state
  const hasError = computed(() => validation.value.$error);
  const isValid = computed(() => !validation.value.$invalid);
  const isTouched = computed(() => validation.value.$dirty);
  const isValidating = computed(() => validation.value.$pending);

  // Error message handling
  const errorMessage = computed(() => {
    if (!hasError.value || !validation.value.$errors.length) {
      return '';
    }
    return formatErrorMessage(validation.value.$errors[0]);
  });

  const errorMessages = computed(() => {
    if (!hasError.value) {
      return [];
    }
    return validation.value.$errors.map(formatErrorMessage);
  });

  // Validation state object
  const validationState = computed<FormValidationState>(() => ({
    isTouched: isTouched.value,
    isValidating: isValidating.value,
    hasError: hasError.value,
    isValid: isValid.value,
    errorMessage: errorMessage.value,
    errorMessages: errorMessages.value,
  }));

  // Methods
  const touch = () => validation.value.$touch();
  const reset = () => validation.value.$reset();
  const validate = async () => {
    await validation.value.$validate();
    return isValid.value;
  };

  // Auto-validate on mount if enabled
  if (validateOnMount) {
    validate();
  }

  // Watch for value changes and validate if enabled
  if (validateOnChange) {
    watch(value, () => {
      if (isTouched.value) {
        validate();
      }
    });
  }

  return {
    validation,
    validationState,
    hasError,
    isValid,
    isTouched,
    isValidating,
    errorMessage,
    errorMessages,
    touch,
    reset,
    validate,
  };
}

/**
 * Provides validation for multiple form fields
 * @param fields - Object of field values and their validation rules
 * @param options - Validation options
 * @returns Form validation utilities for multiple fields
 *
 * @example
 * const formData = reactive({
 *   email: '',
 *   password: ''
 * });
 *
 * const { validation, isFormValid, validateForm } = useMultiFieldValidation(
 *   {
 *     email: { value: toRef(formData, 'email'), rules: { required, email } },
 *     password: { value: toRef(formData, 'password'), rules: { required, minLength: minLength(8) } }
 *   }
 * );
 */
export function useMultiFieldValidation(
  fields: Record<string, { value: Ref<any>; rules: ValidationRules }>,
  options: UseFormValidationOptions = {}
) {
  // Create validation rules for all fields
  const validationRules = computed(() => {
    const rules: Record<string, ValidationRules> = {};
    Object.entries(fields).forEach(([key, field]) => {
      rules[key] = field.rules;
    });
    return rules;
  });

  // Create validation state for all fields
  const validationState = computed(() => {
    const state: Record<string, any> = {};
    Object.entries(fields).forEach(([key, field]) => {
      state[key] = field.value.value;
    });
    return state;
  });

  // Create validation instance
  const validation = useVuelidate(validationRules, validationState, {
    $autoDirty: options.validateOnChange !== false,
  });

  // Form-level computed properties
  const isFormValid = computed(() => !validation.value.$invalid);
  const hasFormErrors = computed(() => validation.value.$error);
  const isFormValidating = computed(() => validation.value.$pending);

  // Methods
  const touchForm = () => validation.value.$touch();
  const resetForm = () => validation.value.$reset();
  const validateForm = async () => {
    await validation.value.$validate();
    return isFormValid.value;
  };

  // Field-specific utilities
  const getFieldValidation = (fieldName: string) => {
    return validation.value[fieldName];
  };

  const getFieldError = (fieldName: string) => {
    const fieldValidation = getFieldValidation(fieldName);
    return fieldValidation?.$error
      ? fieldValidation.$errors[0]?.$message || 'Invalid value'
      : '';
  };

  return {
    validation,
    isFormValid,
    hasFormErrors,
    isFormValidating,
    touchForm,
    resetForm,
    validateForm,
    getFieldValidation,
    getFieldError,
  };
}
