import { escapeRegExp } from './string';

/**
 * Normalize an email address to ensure emails are compared in a
 * case-insensitive way
 *
 * @param email
 * @returns Normalized email address
 */
export function normalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Replace merge fields in a text string with their corresponding values.
 * Merge fields are in the format *|FIELD_NAME|*.
 *
 * @param text The text containing merge field placeholders
 * @param mergeFields The merge field values to replace
 * @returns The text with merge fields replaced
 */
export function replaceMergeFields(
  text: string,
  mergeFields: Record<string, string>
): string {
  return Object.entries(mergeFields).reduce((result, [field, value]) => {
    const escapedField = escapeRegExp(field);
    return result.replace(
      new RegExp(`\\*\\|${escapedField}\\|\\*`, 'g'),
      value
    );
  }, text);
}
