import type { CalloutResponseAnswersNestable } from "./index.ts";

/**
 * Answers are grouped by slide key: `{[slideId]: {[componentKey]: answer | answer[]}}`
 */
export type CalloutResponseAnswersSlide = Record<
  string,
  CalloutResponseAnswersNestable | undefined
>;
