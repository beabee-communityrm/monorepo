import type { ActivityEventType } from '../data/index.js';

/**
 * The kinds of item an activity event can be about. Every event type is named
 * `<target type>.<action>` and its target ID is the ID of an item of that type,
 * so this is derived from the event types
 */
export type ActivityTargetType =
  `${ActivityEventType}` extends `${infer T}.${string}` ? T : never;
