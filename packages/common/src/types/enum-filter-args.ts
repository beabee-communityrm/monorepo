import type { BaseFilterArgs } from "./index.js";

export interface EnumFilterArgs<T extends readonly string[]>
  extends BaseFilterArgs {
  type: "enum";
  options: T;
}
