import type {
  ValidatedBooleanRule,
  ValidatedNumberRule,
  ValidatedStringRule,
} from '../types/index.js';

export type ValidatedRule<Field extends string> =
  | ValidatedNumberRule<Field>
  | ValidatedStringRule<Field>
  | ValidatedBooleanRule<Field>;
