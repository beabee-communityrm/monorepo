import type { CalloutComponentBaseRules } from "./index.ts";

export interface CalloutComponentBaseSchema {
  id: string;
  type: string;
  key: string;
  label?: string;
  input?: boolean;
  adminOnly?: boolean;
  validate?: CalloutComponentBaseRules;
  [key: string]: unknown;
}
