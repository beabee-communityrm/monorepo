export type CheckboxValue = boolean | 'indeterminate';

export interface SelectItem<T extends string | number> {
  id: T;
  label: string;
  count?: string;
}
