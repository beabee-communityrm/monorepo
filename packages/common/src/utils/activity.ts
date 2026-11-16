import type { ActivityEventType } from '../data/index.js';
import type { ActivityTargetType } from '../types/index.js';

/**
 * Get the kind of item an activity event is about
 */
export function getActivityTargetType(
  eventType: ActivityEventType
): ActivityTargetType {
  // split() can't keep the literal type that ActivityTargetType is derived from
  return eventType.split('.')[0] as ActivityTargetType;
}
