import type { RuleGroup } from "./index.ts";

export interface GetSegmentData {
  id: string;
  name: string;
  ruleGroup: RuleGroup;
  order: number;
}
