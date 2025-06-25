/**
 * Type definitions for list components
 */

/**
 * Base interface for selectable list items
 */
export interface SelectableListItem {
  /** Unique identifier for the item */
  id: string;
}

// Note: AppSelectableListProps is defined in the component itself due to generic constraints

/**
 * Events emitted by the AppSelectableList component
 */
export interface AppSelectableListEmits<T extends SelectableListItem> {
  /** Emitted when an item is clicked */
  click: [item: T, selected: boolean];
}
