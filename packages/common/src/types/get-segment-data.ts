import type { RuleGroup } from "./index.js";

export interface GetSegmentData {
  id: string;
  name: string;
  ruleGroup: RuleGroup;
  order: number;
}
