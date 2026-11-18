import type { ActivityTargetType } from './index.js';

/**
 * The kinds of item an activity event reference can point to: every target
 * type other than those that aren't stored in a table
 */
export type ActivityEventReferenceType = Exclude<
  ActivityTargetType,
  'app' | 'newsletter'
>;
