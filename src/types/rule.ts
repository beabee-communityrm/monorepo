import { RuleOperator, RuleValue } from './index.ts';

export interface Rule {
    field: string;
    operator: RuleOperator;
    value: RuleValue[];
}