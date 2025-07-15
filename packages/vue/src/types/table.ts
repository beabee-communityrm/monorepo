import type { SortType } from '../constants';

/**
 * Base interface for table items
 */
export interface Item {
  /** Whether the item is selected (used for selectable tables) */
  selected?: boolean;
  // TODO: Try applying proper types to this
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Interface for table headers
 */
export interface Header {
  /** Display text for the header */
  text: string;
  /** Key for the data property */
  value: string;
  /** Whether the column can be sorted */
  sortable?: boolean;
  /** CSS width property value */
  width?: string;
  /** Text alignment for the column */
  align?: 'left' | 'right' | 'center';
}

/**
 * Sort configuration interface
 */
export interface Sort {
  /** Field to sort by */
  by: string | null;
  /** Sort direction */
  type: SortType;
}
