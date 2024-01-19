import type { FilterType } from "../types/index.ts";

export type ValidatedRuleValue<T extends FilterType> = T extends "number"
  ? number
  : T extends "boolean" ? boolean
  : string;
