/**
 * Utility functions for generating unique IDs for Vue components
 * Provides consistent ID generation patterns across the application
 */

/**
 * Generates a unique ID with a given prefix
 * @param prefix - The prefix for the ID (default: 'element')
 * @returns A unique ID string
 *
 * @example
 * generateUniqueId('modal') // 'modal-abc123def'
 * generateUniqueId() // 'element-xyz789ghi'
 */
export function generateUniqueId(prefix = 'element'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Generates a unique ID for form fields based on name and prefix
 * @param name - The field name
 * @param prefix - The prefix for the ID (default: 'field')
 * @returns A unique form field ID string
 *
 * @example
 * generateFormFieldId('email', 'input') // 'input-email-abc123'
 * generateFormFieldId('password') // 'field-password-def456'
 */
export function generateFormFieldId(name: string, prefix = 'field'): string {
  return `${prefix}-${name}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generates related IDs for form field accessibility
 * @param baseId - The base ID for the form field
 * @returns Object with related IDs for error, help, prefix, and suffix
 *
 * @example
 * const ids = generateFormFieldIds('input-email-abc123');
 * // {
 * //   baseId: 'input-email-abc123',
 * //   errorId: 'input-email-abc123-error',
 * //   helpId: 'input-email-abc123-help',
 * //   prefixId: 'input-email-abc123-prefix',
 * //   suffixId: 'input-email-abc123-suffix'
 * // }
 */
export function generateFormFieldIds(baseId: string) {
  return {
    baseId,
    errorId: `${baseId}-error`,
    helpId: `${baseId}-help`,
    prefixId: `${baseId}-prefix`,
    suffixId: `${baseId}-suffix`,
  };
}

/**
 * Creates a unique ID for a component instance
 * @param componentName - Name of the component
 * @param instanceId - Optional instance identifier
 * @returns A unique component ID
 *
 * @example
 * generateComponentId('AppModal') // 'app-modal-abc123def'
 * generateComponentId('AppButton', 'submit') // 'app-button-submit-abc123'
 */
export function generateComponentId(
  componentName: string,
  instanceId?: string
): string {
  const kebabName = componentName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
  const suffix = instanceId ? `-${instanceId}` : '';
  return `${kebabName}${suffix}-${Math.random().toString(36).substring(2, 11)}`;
}
