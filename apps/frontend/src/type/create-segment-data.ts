import type { RuleGroup } from '@beabee/beabee-common';

export interface CreateSegmentData {
  name: string;
  ruleGroup: RuleGroup;
  order?: number;
}
