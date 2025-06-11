import { RuleOperator, RuleValue } from './index.js';

export interface Rule {
  field: string;
  operator: RuleOperator;
  value: RuleValue[];
}
