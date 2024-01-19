import type {
  ArrayFilterArgs,
  EnumFilterArgs,
  OtherFilterArgs,
} from "./index.ts";

export type FilterArgs =
  | ArrayFilterArgs<readonly string[] | undefined>
  | EnumFilterArgs<readonly string[]>
  | OtherFilterArgs;
