import type { CalloutResponseAnswers } from "./index.ts";

/**
 * Answers are grouped by slide key: `{[slideId]: {[componentKey]: answer | answer[]}}`
 */
export type CalloutResponseAnswersSlide = Record<
  string,
  CalloutResponseAnswers | undefined
>;
