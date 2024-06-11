import type { Rule, RuleGroup } from '@beabee/beabee-common';

export interface RuleGroupWithEmpty {
  condition: RuleGroup['condition'];
  rules: (Rule | RuleGroup | null)[];
}
