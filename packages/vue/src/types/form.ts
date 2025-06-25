/**
 * Type definitions for form components
 */
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

import type { FormVariant } from '../utils/variants';

/**
 * Copy button configuration for form components
 */
export interface CopyButtonProps {
  /** Title text for the copy button */
  copyButtonTitle?: string;
  /** Success message to show when copy succeeds */
  successMessage?: string;
  /** Error message to show when copy fails */
  errorMessage?: string;
  /** Error description template with {error} placeholder */
  errorDescription?: string;
  /** ARIA label for notification remove button */
  removeAriaLabel?: string;
}

/**
 * Props for the AppInput component
 */
export interface AppInputProps {
  /** The model value of the input */
  modelValue?: number | string;
  /** The type of the input */
  type?: 'password' | 'email' | 'text' | 'date' | 'time' | 'number' | 'url';
  /** The name of the input */
  name?: string;
  /** The label of the input */
  label?: string;
  /** The info message of the input */
  infoMessage?: string;
  /** Whether the input is required */
  required?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the copy button is disabled */
  copyButtonDisabled?: boolean;
  /** The minimum value of the input */
  min?: number | string;
  /** The maximum value of the input */
  max?: number | string;
  /** The value that this input should be the same as */
  sameAs?: number | string;
  /** A regex pattern that the input value should match */
  pattern?: string;
  /** Whether to hide the error message */
  hideErrorMessage?: boolean;
  /** A prefix to display before the input */
  prefix?: string;
  /** A suffix to display after the input */
  suffix?: string;
  /** Whether the input value can be copied to clipboard */
  copyable?: boolean;
  /** Text label for the copy button (if copyable is true) */
  copyLabel?: string;
  /** Custom ID for the input element */
  id?: string;
  /** Props for the copy button */
  copyButtonProps?: CopyButtonProps;
}

/**
 * Props for the AppTextArea component
 */
export interface AppTextAreaProps {
  /** The model value of the textarea */
  modelValue?: string;
  /** The label of the textarea */
  label?: string;
  /** The name of the textarea */
  name?: string;
  /** The info message of the textarea */
  infoMessage?: string;
  /** Whether the textarea is required */
  required?: boolean;
  /** Whether the textarea is disabled */
  disabled?: boolean;
  /** The maximum number of characters allowed */
  maxlength?: number;
  /** Whether the textarea value can be copied to clipboard */
  copyable?: boolean;
  /** Text label for the copy button (if copyable is true) */
  copyLabel?: string;
  /** Whether the copy button is disabled */
  copyButtonDisabled?: boolean;
  /** Custom ID for the textarea element */
  id?: string;
  /** Text to display for required field error */
  requiredErrorText?: string;
  /** Text template for max length error */
  maxLengthErrorText?: string;
  /** Text template for character count */
  characterCountText?: string;
  /** Props for the copy button */
  copyButtonProps?: CopyButtonProps;
}

/**
 * Props for the AppCheckbox component
 */
export interface AppCheckboxProps {
  /** Current checked state of the checkbox */
  modelValue?: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Label text displayed next to the checkbox */
  label?: string;
  /** Optional icon displayed before the label */
  icon?: IconDefinition;
  /** Whether the checkbox is required (validation) */
  required?: boolean;
  /** Color variant affecting border and icon colors */
  variant?: FormVariant;
}

/**
 * Possible values for radio input components
 */
export type RadioInputValue = string | boolean | number;

/**
 * Props for the AppRadioInput component
 */
export interface AppRadioInputProps {
  /** Value of this radio option */
  value: RadioInputValue;
  /** Name attribute for the radio input */
  name: string;
  /** Label text for this radio option */
  label?: string;
  /** CSS class for the wrapper */
  wrapperClass?: string;
  /** CSS class for the label */
  labelClass?: string;
  /** Whether selection is required */
  required?: boolean;
  /** Whether radio input is disabled */
  disabled?: boolean;
  /** Color variant of the radio button */
  variant?: FormVariant;
}

/**
 * Props for the AppSearchInput component
 */
export interface AppSearchInputProps {
  /** The model value of the search input */
  modelValue: string;
  /** The placeholder text for the search input */
  placeholder: string;
}

/**
 * Props for the AppColorInput component
 */
export interface AppColorInputProps {
  /** The id of the color input */
  id: string;
  /** The model value of the color input */
  modelValue: string;
}

// Note: AppSelectProps is defined in the component itself due to generic constraints
