export interface Paginated<T> {
  items: T[];
  offset: number;
  count: number;
  total: number;
}
