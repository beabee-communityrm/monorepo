import { escapeRegExp } from './string.js';

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
 * Extract the domain part of an email address (the part after the @).
 *
 * @param email The email address
 * @returns The domain, or undefined if the email has no domain part
 */
export function getEmailDomain(email: string): string | undefined {
  return email.split('@')[1];
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
