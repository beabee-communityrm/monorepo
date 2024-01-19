import type { BaseFilterArgs } from "./index.ts";

export interface EnumFilterArgs<T extends readonly string[]>
  extends BaseFilterArgs {
  type: "enum";
  options: T;
}
