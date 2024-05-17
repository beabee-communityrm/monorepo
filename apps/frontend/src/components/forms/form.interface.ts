export interface SelectItem {
  id: string | number;
  label: string;
  count?: string;
}

export interface SelectGroup {
  label: string;
  items: SelectItem[];
}
