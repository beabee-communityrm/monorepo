/**
 * Composable for consistent accessibility features across Vue components
 * Provides utilities for ARIA attributes, focus management, and keyboard navigation
 */
import { type ComputedRef, computed } from 'vue';

/**
 * Options for building aria-describedby attributes
 */
export interface UseAriaDescribedByOptions {
  /** Computed ref for the help text ID */
  helpId?: ComputedRef<string>;
  /** Computed ref for the error message ID */
  errorId?: ComputedRef<string>;
  /** Computed ref for the prefix ID */
  prefixId?: ComputedRef<string>;
  /** Computed ref for the suffix ID */
  suffixId?: ComputedRef<string>;
  /** Computed ref indicating if there's an error */
  hasError?: ComputedRef<boolean>;
  /** Computed ref indicating if there's help text */
  hasHelp?: ComputedRef<boolean>;
  /** Computed ref indicating if there's a prefix */
  hasPrefix?: ComputedRef<boolean>;
  /** Computed ref indicating if there's a suffix */
  hasSuffix?: ComputedRef<boolean>;
}

/**
 * Builds the aria-describedby attribute value from various element IDs
 * @param options - Configuration for which IDs to include
 * @returns Computed ref with the aria-describedby value or undefined
 *
 * @example
 * const { ariaDescribedBy } = useAriaDescribedBy({
 *   helpId: computed(() => 'field-help'),
 *   errorId: computed(() => 'field-error'),
 *   hasError: computed(() => true),
 *   hasHelp: computed(() => true)
 * });
 * // Returns: 'field-help field-error'
 */
export function useAriaDescribedBy(options: UseAriaDescribedByOptions) {
  const ariaDescribedBy = computed(() => {
    const descriptions: string[] = [];

    // Add help text ID if help is present
    if (options.hasHelp?.value && options.helpId?.value) {
      descriptions.push(options.helpId.value);
    }

    // Add error ID if there's an error
    if (options.hasError?.value && options.errorId?.value) {
      descriptions.push(options.errorId.value);
    }

    // Add prefix ID if prefix is present
    if (options.hasPrefix?.value && options.prefixId?.value) {
      descriptions.push(options.prefixId.value);
    }

    // Add suffix ID if suffix is present
    if (options.hasSuffix?.value && options.suffixId?.value) {
      descriptions.push(options.suffixId.value);
    }

    return descriptions.length > 0 ? descriptions.join(' ') : undefined;
  });

  return {
    ariaDescribedBy,
  };
}

/**
 * Options for focus management
 */
export interface UseFocusManagementOptions {
  /** Whether auto-focus is enabled */
  autoFocus?: boolean;
  /** Callback when element receives focus */
  onFocus?: () => void;
  /** Callback when element loses focus */
  onBlur?: () => void;
}

/**
 * Provides focus management utilities for components
 * @param options - Focus management configuration
 * @returns Focus management utilities
 *
 * @example
 * const { focusElement, handleFocus, handleBlur } = useFocusManagement({
 *   autoFocus: true,
 *   onFocus: () => console.log('Focused'),
 *   onBlur: () => console.log('Blurred')
 * });
 */
export function useFocusManagement(options: UseFocusManagementOptions = {}) {
  /**
   * Focuses an element by ID or ref
   * @param elementOrId - Element reference or ID string
   */
  const focusElement = (elementOrId: HTMLElement | string) => {
    const element =
      typeof elementOrId === 'string'
        ? document.getElementById(elementOrId)
        : elementOrId;

    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  };

  /**
   * Handle focus event with optional callback
   * @param event - Focus event
   */
  const handleFocus = (event: FocusEvent) => {
    options.onFocus?.();
  };

  /**
   * Handle blur event with optional callback
   * @param event - Blur event
   */
  const handleBlur = (event: FocusEvent) => {
    options.onBlur?.();
  };

  return {
    focusElement,
    handleFocus,
    handleBlur,
  };
}

/**
 * Keyboard navigation utilities
 */
export interface UseKeyboardNavigationOptions {
  /** Whether Enter key should trigger action */
  enableEnter?: boolean;
  /** Whether Space key should trigger action */
  enableSpace?: boolean;
  /** Whether Escape key should trigger action */
  enableEscape?: boolean;
  /** Callback for Enter key */
  onEnter?: (event: KeyboardEvent) => void;
  /** Callback for Space key */
  onSpace?: (event: KeyboardEvent) => void;
  /** Callback for Escape key */
  onEscape?: (event: KeyboardEvent) => void;
}

/**
 * Provides keyboard navigation handling for components
 * @param options - Keyboard navigation configuration
 * @returns Keyboard event handlers
 *
 * @example
 * const { handleKeydown } = useKeyboardNavigation({
 *   enableEnter: true,
 *   enableEscape: true,
 *   onEnter: () => submitForm(),
 *   onEscape: () => closeModal()
 * });
 */
export function useKeyboardNavigation(
  options: UseKeyboardNavigationOptions = {}
) {
  /**
   * Handle keydown events with configured key actions
   * @param event - Keyboard event
   */
  const handleKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        if (options.enableEnter && options.onEnter) {
          event.preventDefault();
          options.onEnter(event);
        }
        break;

      case ' ':
      case 'Space':
        if (options.enableSpace && options.onSpace) {
          event.preventDefault();
          options.onSpace(event);
        }
        break;

      case 'Escape':
        if (options.enableEscape && options.onEscape) {
          event.preventDefault();
          options.onEscape(event);
        }
        break;
    }
  };

  return {
    handleKeydown,
  };
}
