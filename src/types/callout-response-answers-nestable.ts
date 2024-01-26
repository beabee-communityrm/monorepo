import type { CalloutResponseAnswer } from "./index.ts";

/**
 * Answers are grouped by slide key: `{[slideId]: {[componentKey]: answer | answer[]}}`
 */
export type CalloutResponseAnswersNestable = Record<
  string,
  CalloutResponseAnswer | CalloutResponseAnswer[]
>;
