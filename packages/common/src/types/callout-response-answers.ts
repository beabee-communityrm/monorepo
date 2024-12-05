import type { CalloutResponseAnswer } from "./index.js";

/**
 * Answers are grouped by component key: `{[componentKey]: answer | answer[]}`
 */
export type CalloutResponseAnswers = Record<
  string,
  CalloutResponseAnswer | CalloutResponseAnswer[] | undefined
>;
