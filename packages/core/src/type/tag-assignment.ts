import { TagData } from '@beabee/beabee-common';

/**
 * Represents a tag assignment that links a tag to an entity.
 * This is typically a join table/model between an entity and its tags.
 *
 * @example
 * interface ContactTagAssignment {
 *   tag: Tag;
 *   contactId: string;
 * }
 */
export interface TagAssignment<TTag extends TagData> {
  tag: TTag;
  [key: string]: any;
}
