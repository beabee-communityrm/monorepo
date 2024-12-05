import type { CalloutResponseAnswers } from "./index.js";

/**
 * Answers are grouped by slide key: `{[slideId]: {[componentKey]: answer | answer[]}}`
 */
export type CalloutResponseAnswersSlide = Record<
  string,
  CalloutResponseAnswers | undefined
>;
