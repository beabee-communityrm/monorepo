import type { TagData } from '@beabee/beabee-common';
import type { TagAssignment } from './tag-assignment';
/**
 * Represents an entity that can have tags assigned to it.
 * The entity must have an id and a tags array property.
 *
 * @example
 * interface Contact {
 *   id: string;
 *   tags: ContactTagAssignment[];
 * }
 */
export interface TaggableEntity<TTag extends TagData> {
  id: string;
  tags: TagAssignment<TTag>[];
}
