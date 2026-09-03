import type { ActivityEventType } from '../data/index.js';
import type { ContactOriginData } from './index.js';

export interface ActivityEventMetadataMap {
  [ActivityEventType.ContactCreated]: ContactOriginData;
  [ActivityEventType.EmailSent]: { email: string; recipient: string };
}

/**
 * The metadata for a given activity event type, or never if it carries none
 */
export type ActivityEventMetadata<T extends ActivityEventType> =
  T extends keyof ActivityEventMetadataMap
    ? ActivityEventMetadataMap[T]
    : never;
