import type { RuleGroup } from './index.js';

export interface CreateSegmentData {
  name: string;
  ruleGroup: RuleGroup;
  order?: number;
}
