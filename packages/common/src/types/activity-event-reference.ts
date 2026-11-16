/**
 * A named pointer to the item an activity event was caused by or is about
 */
export interface ActivityEventReference {
  /** The event type prefix for this kind of item, e.g. `contact` */
  type: string;
  id: string;
  name: string;
}
