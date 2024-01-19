import type { Rule } from "./index.ts";

export interface RuleGroup {
  condition: "AND" | "OR";
  rules: (RuleGroup | Rule)[];
}
