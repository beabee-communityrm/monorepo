import type { CalloutComponentNumberRules } from "../../../../../mod.ts";

export const calloutComponentValidateNumber1: CalloutComponentNumberRules = {
  max: 100,
  min: 0,
  step: "any",
  integer: "",
  required: false,
};
