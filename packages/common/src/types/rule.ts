import { type RuleOperator, type RuleValue } from './index.js';

export interface Rule {
  field: string;
  operator: RuleOperator;
  value: RuleValue[];
}
