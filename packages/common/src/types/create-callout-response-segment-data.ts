import type { RuleGroup } from './index.js';

export interface CreateCalloutResponseSegmentData {
  name: string;
  ruleGroup: RuleGroup;
  calloutId: string;
  order?: number;
}
