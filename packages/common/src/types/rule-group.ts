import type { Rule } from "./index.js";

export interface RuleGroup {
  condition: "AND" | "OR";
  rules: (RuleGroup | Rule)[];
}
