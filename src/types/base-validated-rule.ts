import type { FilterType, ValidatedRuleValue } from "./index.ts";
import type { operatorsByType } from "../search/operators.ts";

export interface BaseValidatedRule<T extends FilterType, F extends string> {
  type: T;
  field: F;
  nullable: boolean;
  operator: keyof (typeof operatorsByType)[T];
  value: ValidatedRuleValue<T>[];
}
