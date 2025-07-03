import {
  type ArrayFilterArgs,
  type EnumFilterArgs,
  type OtherFilterArgs,
} from '@beabee/beabee-common';

import type { Ref } from 'vue';

import type {
  FilterItem,
  FilterItemArray,
  FilterItemEnum,
  FilterItemOther,
  FilterItems,
} from '../type/search';

interface LabelOpts {
  prefix: string;
}

/**
 * Create filter items with labels and options
 */
export function withLabel<T extends readonly string[]>(
  args: EnumFilterArgs<T>,
  label: string,
  optionLabels: Record<T[number], string>
): FilterItemEnum<T>;
export function withLabel(
  args: ArrayFilterArgs<undefined>,
  label: string,
  opts?: LabelOpts
): FilterItemArray<undefined>;
export function withLabel<T extends readonly string[]>(
  args: ArrayFilterArgs<T>,
  label: string,
  optionLabels: Record<T[number], string>
): FilterItemArray<T>;
export function withLabel(
  args: OtherFilterArgs,
  label: string,
  opts?: LabelOpts
): FilterItemOther;
export function withLabel<T extends readonly string[]>(
  args: EnumFilterArgs<T> | ArrayFilterArgs<T> | OtherFilterArgs,
  label: string,
  extraArg?: Record<T[number], string> | LabelOpts
): FilterItem {
  if (args.type === 'enum' || (args.type === 'array' && args.options)) {
    const optionLabels = extraArg as Record<T[number], string>;
    return {
      ...args,
      label,
      options: (args.options || []).map((id: T[number]) => ({
        id,
        label: optionLabels[id],
      })),
    };
  } else {
    const args2 = args as OtherFilterArgs | ArrayFilterArgs<undefined>;
    const opts = extraArg as LabelOpts | undefined;
    return { ...args2, label, ...opts };
  }
}

/**
 * Extract subset of filter items by IDs
 */
export function withItems<T extends string, S extends T>(
  items: Ref<FilterItems<T>>,
  itemIds: S[]
): FilterItems<S> {
  const ret: Partial<FilterItems<S>> = {};
  for (const id of itemIds) {
    ret[id] = items.value[id];
  }
  return ret as FilterItems<S>;
}
