import type {
  OtherFilterArgs,
  ArrayFilterArgs,
  EnumFilterArgs,
} from '@beabee/beabee-common';

export interface FilterItemOther extends OtherFilterArgs {
  label: string;
  prefix?: string;
}

export interface FilterItemArray<T extends readonly string[] | undefined>
  extends Omit<ArrayFilterArgs<T>, 'options'> {
  label: string;
  prefix?: string;
  options?: { id: string; label: string }[];
}

export interface FilterItemEnum<T extends readonly string[]>
  extends Omit<EnumFilterArgs<T>, 'options'> {
  label: string;
  options: { id: T[number]; label: string }[];
}

export type FilterItem =
  | FilterItemOther
  | FilterItemArray<readonly string[] | undefined>
  | FilterItemEnum<readonly string[]>;

export type FilterItems<T extends string = string> = Record<T, FilterItem>;
