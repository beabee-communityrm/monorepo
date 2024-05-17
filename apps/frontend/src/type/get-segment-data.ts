import type { RuleGroup } from '@beabee/beabee-common';

export interface GetSegmentData {
  id: string;
  name: string;
  ruleGroup: RuleGroup;
  order: number;
}
