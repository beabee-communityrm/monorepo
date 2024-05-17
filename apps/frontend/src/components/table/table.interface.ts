export interface Item {
  selected?: boolean;
  // TODO: Try applying proper types to this
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Header {
  text: string;
  value: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

export enum SortType {
  Desc = 'DESC',
  Asc = 'ASC',
}
