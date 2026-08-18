/**
 * How `ContactNewsletterUpdates.newsletterGroups` should be applied.
 *
 * - `add`: add these groups, leave every other group untouched
 * - `remove`: remove these groups, leave every other group untouched
 * - `replace` (default): the contact's groups become exactly this list
 */
export type NewsletterGroupChange = 'add' | 'remove' | 'replace';
