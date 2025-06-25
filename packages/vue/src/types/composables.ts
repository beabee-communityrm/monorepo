/**
 * Type definitions for composables
 */
import type { Validation } from '@vuelidate/core';
import type { ComputedRef, Ref } from 'vue';

/**
 * Configuration for form field validation
 */
export interface FormFieldValidationConfig {
  /** Whether the field is required */
  required?: boolean;
  /** Minimum value (for numbers) or length (for strings) */
  min?: number;
  /** Maximum value (for numbers) or length (for strings) */
  max?: number;
  /** Email validation */
  email?: boolean;
  /** URL validation */
  url?: boolean;
  /** Must match another value */
  sameAs?: any;
  /** Custom regex pattern */
  pattern?: string;
}

/**
 * Return type for useFormValidation composable
 */
export interface FormValidationReturn {
  /** Vuelidate validation instance */
  validation: Validation;
  /** Whether the field has validation errors */
  hasError: ComputedRef<boolean>;
  /** Array of error messages */
  errorMessages: ComputedRef<string[]>;
  /** First error message (most commonly used) */
  firstError: ComputedRef<string | undefined>;
  /** Whether validation has been touched */
  isTouched: ComputedRef<boolean>;
  /** Whether validation is pending */
  isPending: ComputedRef<boolean>;
}

/**
 * Configuration for multi-field validation
 */
export interface MultiFieldValidationConfig {
  [fieldName: string]: FormFieldValidationConfig;
}

/**
 * Return type for useMultiFieldValidation composable
 */
export interface MultiFieldValidationReturn {
  /** Vuelidate validation instance for all fields */
  validation: Validation;
  /** Whether any field has validation errors */
  hasAnyError: ComputedRef<boolean>;
  /** Whether all fields are valid */
  isValid: ComputedRef<boolean>;
  /** Get validation for a specific field */
  getFieldValidation: (fieldName: string) => ComputedRef<Validation>;
  /** Get error messages for a specific field */
  getFieldErrors: (fieldName: string) => ComputedRef<string[]>;
}

/**
 * Configuration for aria-describedby functionality
 */
export interface AriaDescribedByConfig {
  /** ID of the main element */
  elementId: string;
  /** ID of error message element */
  errorId?: string;
  /** ID of help text element */
  helpId?: string;
  /** ID of info message element */
  infoId?: string;
}

/**
 * Return type for useAriaDescribedBy composable
 */
export interface AriaDescribedByReturn {
  /** Computed aria-describedby attribute value */
  ariaDescribedBy: ComputedRef<string | undefined>;
  /** Update the configuration */
  updateConfig: (config: Partial<AriaDescribedByConfig>) => void;
}

/**
 * Configuration for focus management
 */
export interface FocusManagementConfig {
  /** Whether to focus on mount */
  focusOnMount?: boolean;
  /** Selector for focus trap boundaries */
  trapBoundaries?: string;
  /** Whether to restore focus on unmount */
  restoreFocus?: boolean;
}

/**
 * Return type for useFocusManagement composable
 */
export interface FocusManagementReturn {
  /** Focus the element */
  focus: () => void;
  /** Blur the element */
  blur: () => void;
  /** Check if element is focused */
  isFocused: Ref<boolean>;
  /** Set up focus trap */
  setupFocusTrap: () => void;
  /** Restore previous focus */
  restorePreviousFocus: () => void;
}

/**
 * Configuration for keyboard navigation
 */
export interface KeyboardNavigationConfig {
  /** Enable arrow key navigation */
  arrows?: boolean;
  /** Enable tab navigation */
  tab?: boolean;
  /** Enable enter/space activation */
  activation?: boolean;
  /** Enable escape handling */
  escape?: boolean;
}

/**
 * Return type for useKeyboardNavigation composable
 */
export interface KeyboardNavigationReturn {
  /** Handle keydown events */
  onKeydown: (event: KeyboardEvent) => void;
  /** Current active index (for arrow navigation) */
  activeIndex: Ref<number>;
  /** Set active index */
  setActiveIndex: (index: number) => void;
}

/**
 * Notification helper functions return type
 */
export interface NotificationHelpersReturn {
  /** Show success notification */
  showSuccess: (message: string, description?: string) => void;
  /** Show error notification */
  showError: (message: string, description?: string) => void;
  /** Show info notification */
  showInfo: (message: string, description?: string) => void;
  /** Show warning notification */
  showWarning: (message: string, description?: string) => void;
  /** Copy text to clipboard with notifications */
  copyToClipboard: (
    text: string,
    successMessage?: string,
    errorMessage?: string,
    errorDescription?: string
  ) => Promise<void>;
}
