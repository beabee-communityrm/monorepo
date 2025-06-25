/**
 * Utility functions and constants for component styling variants
 * Provides consistent styling patterns across button, form, and other components
 */

/**
 * Button variant styling definitions
 * Each variant contains base, hover, and loading icon color classes
 */
export const buttonVariants = {
  primary: {
    base: 'bg-primary-70 text-white border-primary-70',
    hover: 'hover:bg-primary-80',
    loading: 'text-primary',
  },
  link: {
    base: 'bg-link text-white border-link',
    hover: 'hover:bg-link-110',
    loading: 'text-link',
  },
  primaryOutlined: {
    base: 'bg-white text-primary-80 border-primary-40',
    hover: 'hover:bg-primary-10 hover:text-primary hover:border-primary-70',
    loading: 'text-primary',
  },
  linkOutlined: {
    base: 'bg-white text-link border-link',
    hover: 'hover:bg-link-10',
    loading: 'text-link',
  },
  dangerOutlined: {
    base: 'bg-white text-danger border-danger',
    hover: 'hover:bg-danger-10',
    loading: 'text-danger',
  },
  greyOutlined: {
    base: 'bg-white text-body-80 border-grey-light',
    hover: 'hover:border-grey',
    loading: 'text-body',
  },
  text: {
    base: 'underline text-link border-0',
    hover: 'hover:text-link-110',
    loading: '',
  },
  danger: {
    base: 'bg-danger text-white border-danger',
    hover: 'hover:bg-danger-110',
    loading: 'text-danger',
  },
  dangerText: {
    base: 'underline text-danger border-0',
    hover: 'hover:text-danger-110',
    loading: '',
  },
  dangerGhost: {
    base: 'bg-transparent border-0 text-body-60',
    hover: 'hover:text-danger-70',
    loading: 'text-body-60',
  },
} as const;

/**
 * Button size styling definitions
 */
export const buttonSizes = {
  xs: 'text-sm px-2 py-1',
  sm: 'text-sm p-2',
  md: 'px-3 py-2.5',
  lg: 'text-3xl px-4.5 py-4',
} as const;

/**
 * Form field variant styling for borders and icons
 */
export const formVariants = {
  primary: {
    border: 'border-primary border-2',
    icon: 'text-primary',
    hover: 'hover:text-primary-120 hover:border-primary-120',
  },
  link: {
    border: 'border-link border-2',
    icon: 'text-link',
    hover: 'hover:text-link-120 hover:border-link-120',
  },
  danger: {
    border: 'border-danger border-2',
    icon: 'text-danger',
    hover: 'hover:text-danger-120 hover:border-danger-120',
  },
} as const;

/**
 * Input field state styling
 */
export const inputStates = {
  default: 'border-primary-40 bg-white',
  error: 'border-danger-70 bg-danger-10',
  disabled: 'border-primary-40 bg-grey-lighter',
} as const;

/**
 * Toggle switch variant styling for active states
 */
export const toggleSwitchVariants = {
  primary: {
    active: 'bg-primary hover:bg-primary-110',
    inactive: 'bg-grey-light hover:bg-grey',
  },
  link: {
    active: 'bg-link hover:bg-link-110',
    inactive: 'bg-grey-light hover:bg-grey',
  },
  danger: {
    active: 'bg-danger hover:bg-danger-110',
    inactive: 'bg-grey-light hover:bg-grey',
  },
} as const;

/**
 * Toggle switch size styling
 */
export const toggleSwitchSizes = {
  default: {
    container: 'h-6 w-11 rounded-full',
    switch: 'h-5 w-5 rounded-full',
    translate: 'translate-x-5',
  },
  small: {
    container: 'h-5 w-9 rounded-full',
    switch: 'h-4 w-4 rounded-full',
    translate: 'translate-x-4',
  },
} as const;

// Type definitions
export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;
export type FormVariant = keyof typeof formVariants;
export type InputState = keyof typeof inputStates;
export type ToggleSwitchVariant = keyof typeof toggleSwitchVariants;
export type ToggleSwitchSize = keyof typeof toggleSwitchSizes;

/**
 * Gets button variant classes for a given variant and state
 * @param variant - The button variant
 * @param state - The button state ('base', 'hover', 'loading')
 * @returns The CSS classes for the variant and state
 *
 * @example
 * getButtonVariantClasses('primary', 'base') // 'bg-primary-70 text-white border-primary-70'
 * getButtonVariantClasses('danger', 'hover') // 'hover:bg-danger-110'
 */
export function getButtonVariantClasses(
  variant: ButtonVariant,
  state: keyof typeof buttonVariants.primary = 'base'
): string {
  return buttonVariants[variant]?.[state] || buttonVariants.primary[state];
}

/**
 * Gets button size classes
 * @param size - The button size
 * @returns The CSS classes for the size
 *
 * @example
 * getButtonSizeClasses('md') // 'px-3 py-2.5'
 * getButtonSizeClasses('lg') // 'text-3xl px-4.5 py-4'
 */
export function getButtonSizeClasses(size: ButtonSize): string {
  return buttonSizes[size] || buttonSizes.md;
}

/**
 * Gets form field variant classes for a given variant and state
 * @param variant - The form field variant
 * @param state - The form field state ('border', 'icon', 'hover')
 * @returns The CSS classes for the variant and state
 *
 * @example
 * getFormVariantClasses('primary', 'border') // 'border-primary border-2'
 * getFormVariantClasses('danger', 'icon') // 'text-danger'
 */
export function getFormVariantClasses(
  variant: FormVariant,
  state: keyof typeof formVariants.primary = 'border'
): string {
  return formVariants[variant]?.[state] || formVariants.link[state];
}

/**
 * Gets input field state classes
 * @param state - The input state
 * @returns The CSS classes for the input state
 *
 * @example
 * getInputStateClasses('error') // 'border-danger-70 bg-danger-10'
 * getInputStateClasses('disabled') // 'border-primary-40 bg-grey-lighter'
 */
export function getInputStateClasses(state: InputState): string {
  return inputStates[state] || inputStates.default;
}

/**
 * Gets toggle switch variant classes for a given variant and state
 * @param variant - The toggle switch variant
 * @param isActive - Whether the switch is in active state
 * @returns The CSS classes for the variant and state
 *
 * @example
 * getToggleSwitchVariantClasses('primary', true) // 'bg-primary hover:bg-primary-110'
 * getToggleSwitchVariantClasses('danger', false) // 'bg-grey-light hover:bg-grey'
 */
export function getToggleSwitchVariantClasses(
  variant: ToggleSwitchVariant,
  isActive: boolean
): string {
  const state = isActive ? 'active' : 'inactive';
  return (
    toggleSwitchVariants[variant]?.[state] ||
    toggleSwitchVariants.primary[state]
  );
}

/**
 * Gets toggle switch size classes for a given size and element
 * @param size - The toggle switch size
 * @param element - The element type ('container', 'switch', 'translate')
 * @returns The CSS classes for the size and element
 *
 * @example
 * getToggleSwitchSizeClasses('default', 'container') // 'h-6 w-11 rounded-full'
 * getToggleSwitchSizeClasses('small', 'switch') // 'h-4 w-4 rounded-full'
 */
export function getToggleSwitchSizeClasses(
  size: ToggleSwitchSize,
  element: keyof typeof toggleSwitchSizes.default
): string {
  return (
    toggleSwitchSizes[size]?.[element] || toggleSwitchSizes.default[element]
  );
}

// Template component variants
export const templateVariants = {
  primary: 'border-primary-40 bg-primary-5 text-primary-80',
  secondary: 'border-grey-light bg-grey-lighter text-body',
  success: 'border-success-30 bg-success-10 text-success-110',
  warning: 'border-warning-30 bg-warning-10 text-warning',
  danger: 'border-danger-30 bg-danger-10 text-danger-110',
} as const;

// Template component sizes
export const templateSizes = {
  sm: 'p-3 text-sm',
  md: 'p-4',
  lg: 'p-6 text-lg',
} as const;

/**
 * Get template variant classes
 */
export function getTemplateVariantClasses(
  variant: keyof typeof templateVariants
): string {
  return templateVariants[variant];
}

/**
 * Get template size classes
 */
export function getTemplateSizeClasses(
  size: keyof typeof templateSizes
): string {
  return templateSizes[size];
}

// Badge component variants
export const badgeSizes = {
  large: 'w-4 h-4',
  small: 'w-2 h-2',
} as const;

export const badgeColors = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
} as const;

/**
 * Get badge size classes
 */
export function getBadgeSizeClasses(size: keyof typeof badgeSizes): string {
  return badgeSizes[size];
}

/**
 * Get badge color classes
 */
export function getBadgeColorClasses(type: keyof typeof badgeColors): string {
  return badgeColors[type];
}
