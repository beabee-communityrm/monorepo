import type { ActivityEventReferenceType } from './index.js';

/**
 * A named pointer to the item an activity event was caused by or is about
 */
export interface ActivityEventReference {
  type: ActivityEventReferenceType;
  id: string;
  name: string;
}
