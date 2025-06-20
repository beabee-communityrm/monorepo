import type { ValidatedRule } from '../types/index.js';

export interface ValidatedRuleGroup<Field extends string> {
  condition: 'AND' | 'OR';
  rules: (ValidatedRuleGroup<Field> | ValidatedRule<Field>)[];
}
