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
    return result.replace(new RegExp(`\\*\\|${field}\\|\\*`, 'g'), value);
  }, text);
}

/**
 * Expand nested merge fields in merge field values.
 * This handles cases where a merge field value itself contains other merge fields.
 * For example, a MESSAGE field containing *|FNAME|* will have FNAME expanded.
 *
 * @param mergeFields The merge fields to expand
 * @returns The merge fields with nested merge fields expanded
 */
export function expandNestedMergeFields(
  mergeFields: Record<string, string>
): Record<string, string> {
  const expandedFields = { ...mergeFields };

  // Iterate over each field and replace any nested merge fields
  Object.keys(expandedFields).forEach((field) => {
    expandedFields[field] = replaceMergeFields(
      expandedFields[field],
      expandedFields
    );
  });

  return expandedFields;
}
