import type { BaseFilterArgs } from "./index.ts";

export interface ArrayFilterArgs<T extends readonly string[] | undefined>
  extends BaseFilterArgs {
  type: "array";
  options?: T;
}
