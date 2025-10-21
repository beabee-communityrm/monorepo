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

  // Process each field individually to avoid circular reference issues
  Object.keys(expandedFields).forEach((field) => {
    // Extract all merge field names from the current field value
    const mergeFieldPattern = /\*\|([^|]+)\|\*/g;
    const referencedFields = new Set<string>();
    let match;

    while ((match = mergeFieldPattern.exec(expandedFields[field])) !== null) {
      referencedFields.add(match[1]);
    }

    // Only expand if the field doesn't reference itself or create circular dependencies
    const otherFields = Object.keys(expandedFields).filter((f) => f !== field);
    const safeReferences = Array.from(referencedFields).filter(
      (ref) =>
        !otherFields.includes(ref) ||
        !expandedFields[ref]?.includes(`*|${field}|*`)
    );

    if (safeReferences.length === referencedFields.size) {
      // Safe to expand - no circular references detected
      expandedFields[field] = replaceMergeFields(
        expandedFields[field],
        expandedFields
      );
    }
  });

  return expandedFields;
}
