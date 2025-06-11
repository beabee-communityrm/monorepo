import type { BaseValidatedRule } from '../types/index.js';

export type ValidatedBooleanRule<Field extends string> = BaseValidatedRule<
  'boolean',
  Field
>;
