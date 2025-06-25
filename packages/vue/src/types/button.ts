/**
 * Type definitions for button components
 */
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import type { RouteLocationRaw } from 'vue-router';

import type {
  ButtonSize,
  ButtonVariant,
  ToggleSwitchSize,
  ToggleSwitchVariant,
} from '../utils/variants';

/**
 * Props for the AppButton component
 */
export interface AppButtonProps {
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show loading state */
  loading?: boolean;
  /** HTML button type */
  type?: 'button' | 'submit';
  /** URL for anchor tag */
  href?: string;
  /** Opens link in new tab */
  external?: boolean;
  /** Vue Router destination */
  to?: RouteLocationRaw;
  /** Button style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** FontAwesome icon */
  icon?: IconDefinition;
  /** Component element type */
  is?: 'button' | 'label';
  /** Accessible name */
  name?: string;
  /** Tooltip text */
  title?: string;
}

/**
 * Props for the AppCopyButton component
 */
export interface AppCopyButtonProps {
  /** The text to copy to clipboard */
  text: string;
  /** Visual variant affecting button styling */
  variant?: 'normal' | 'float';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Optional text label to show next to the icon */
  label?: string;
  /** Aria label for the remove button on notifications */
  removeAriaLabel?: string;
  /** Title text for the copy button */
  copyButtonTitle?: string;
  /** Success message to show when copy succeeds */
  successMessage?: string;
  /** Error message to show when copy fails */
  errorMessage?: string;
  /** Error description template with {error} placeholder (optional) */
  errorDescription?: string;
}

/**
 * Props for the AppAsyncButton component
 */
export interface AppAsyncButtonProps {
  /** Async function to execute when the button is clicked */
  onClick?: (evt: Event) => Promise<void>;
  /** Accessible label for the button */
  ariaLabel?: string;
  /** Tooltip text displayed on hover */
  title?: string;
  /** Text announced to screen readers during loading state */
  loadingText?: string;
  /** Error message to show when async operation fails */
  errorMessage?: string;
  /** Error description for screen readers when async operation fails */
  errorDescription?: string;
  /** Aria label for the remove button on error notifications */
  removeAriaLabel?: string;
}

// Define the allowed variants for the dropdown button
export type DropdownButtonVariant =
  | 'primaryOutlined'
  | 'linkOutlined'
  | 'dangerOutlined'
  | 'greyOutlined';

/**
 * Props for the AppDropdownButton component
 */
export interface AppDropdownButtonProps {
  /** FontAwesome icon to display in the button trigger */
  icon: IconDefinition;
  /** Button title and accessible label text */
  title: string;
  /** Visual style variant for the button trigger */
  variant: DropdownButtonVariant;
  /** Whether to display the title text alongside the icon */
  showTitle?: boolean;
  /** Whether the dropdown button is disabled */
  disabled?: boolean;
}

/**
 * Dropdown menu item configuration
 */
export interface DropdownItem {
  /** Display label for the item */
  label: string;
  /** Optional icon for the item */
  icon?: IconDefinition;
  /** Click handler for the item */
  action: () => void;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** CSS class for styling */
  class?: string;
}

/**
 * Props for the AppToggleSwitch component
 */
export interface AppToggleSwitchProps {
  /** Current state of the toggle switch */
  modelValue: boolean;
  /** Color variant affecting the active state styling */
  variant?: ToggleSwitchVariant;
  /** Size variant affecting dimensions */
  size?: ToggleSwitchSize;
  /** Whether the switch is disabled */
  disabled?: boolean;
}
