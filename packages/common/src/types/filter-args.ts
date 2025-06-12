import type {
  ArrayFilterArgs,
  EnumFilterArgs,
  OtherFilterArgs,
} from './index.js';

export type FilterArgs =
  | ArrayFilterArgs<readonly string[] | undefined>
  | EnumFilterArgs<readonly string[]>
  | OtherFilterArgs;
