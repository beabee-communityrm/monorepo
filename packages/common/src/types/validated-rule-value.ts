import type { FilterType } from "../types/index.js";

export type ValidatedRuleValue<T extends FilterType> = T extends "number"
  ? number
  : T extends "boolean"
    ? boolean
    : string;
