import type { RuleGroup } from "./index.ts";

export interface CreateSegmentData {
  name: string;
  ruleGroup: RuleGroup;
  order?: number;
}
