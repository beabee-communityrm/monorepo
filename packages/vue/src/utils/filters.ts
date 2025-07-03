import type {
  ArrayFilterArgs,
  EnumFilterArgs,
  OtherFilterArgs,
} from '@beabee/beabee-common';

import type { Ref } from 'vue';

// Simple re-exports of the functions that were moved to frontend
// This maintains compatibility for existing vue package users

export interface FilterItem {
  type: string;
  label: string;
  options?: { id: string; label: string }[];
  prefix?: string;
}

export type FilterItems<T extends string = string> = Record<T, FilterItem>;

interface LabelOpts {
  prefix: string;
}

/**
 * Create filter items with labels and options
 */
export function withLabel(
  args:
    | EnumFilterArgs<readonly string[]>
    | ArrayFilterArgs<readonly string[] | undefined>
    | OtherFilterArgs,
  label: string,
  extraArg?: Record<string, string> | LabelOpts
): FilterItem {
  if (args.type === 'enum' || (args.type === 'array' && args.options)) {
    const optionLabels = extraArg as Record<string, string>;
    return {
      ...args,
      label,
      options: (args.options || []).map((id: string) => ({
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
