import { FilterHandlers } from '@beabee/core/type';
import { calloutTagFilterHandler } from '@beabee/core/filter-handlers/tag.filter-handlers';
import { RuleOperator } from '@beabee/beabee-common';

/**
 * @fileoverview Filter handlers for callout responses, managing answer filtering and tag operations
 * @module callout-response.filter-handlers
 */

/**
 * Operators for handling array-type answers in callout responses
 * These operators handle the special case where arrays are stored as objects with boolean values
 * Arrays are actually {a: true, b: false} type objects in answers
 */
const answerArrayOperators: Partial<
  Record<RuleOperator, (field: string) => string>
> = {
  contains: (field) => `(${field} -> :valueA)::boolean`,
  not_contains: (field) => `NOT (${field} -> :valueA)::boolean`,
  is_empty: (field) => `NOT jsonb_path_exists(${field}, '$.* ? (@ == true)')`,
  is_not_empty: (field) => `jsonb_path_exists(${field}, '$.* ? (@ == true)')`,
};

/**
 * Collection of filter handlers for callout responses
 *
 * Special handling for:
 * - Array types (using custom operators for boolean-value objects)
 * - Empty/not empty checks for JSONB values
 * - Type casting for number and boolean comparisons
 * - Text extraction for string comparisons
 */
export const calloutResponseFilterHandlers: FilterHandlers<string> = {
  /**
   * Handles filtering by callout response tags
   */
  tags: calloutTagFilterHandler,
  /**
   * Text search across all answers in a response by aggregating them into a
   * single string
   */
  answers: (qb, args) => {
    qb.where(
      args.convertToWhereClause(`(
          SELECT string_agg(answer.value, '')
          FROM jsonb_each(${args.fieldPrefix}answers) AS slide, jsonb_each_text(slide.value) AS answer
        )`)
    );
  },
  /**
   * Filter responses by a specific answer. The key will be formatted as
   * answers.<slideId>.<answerKey>.
   *
   * Answers are stored as a JSONB object, this method maps the filter
   * operators to their appropriate JSONB operators.
   */
  'answers.': (qb, args) => {
    const answerField = `${args.fieldPrefix}answers -> :slideId -> :answerKey`;

    if (args.type === 'array') {
      // Override operator function for array types
      const operatorFn = answerArrayOperators[args.operator];
      if (!operatorFn) {
        // Shouln't be able to happen as rule has been validated
        throw new Error('Invalid ValidatedRule');
      }
      qb.where(args.addParamSuffix(operatorFn(answerField)));
    } else if (
      args.operator === 'is_empty' ||
      args.operator === 'is_not_empty'
    ) {
      // is_empty and is_not_empty need special treatment for JSONB values
      const operator = args.operator === 'is_empty' ? 'IN' : 'NOT IN';
      qb.where(
        args.addParamSuffix(
          `COALESCE(${answerField}, 'null') ${operator} ('null', '""')`
        )
      );
    } else if (args.type === 'number' || args.type === 'boolean') {
      // Cast from JSONB to native type for comparison
      const cast = args.type === 'number' ? 'numeric' : 'boolean';
      qb.where(args.convertToWhereClause(`(${answerField})::${cast}`));
    } else {
      // Extract as text instead of JSONB (note ->> instead of ->)
      qb.where(
        args.convertToWhereClause(
          `${args.fieldPrefix}answers -> :slideId ->> :answerKey`
        )
      );
    }

    const [_, slideId, answerKey] = args.field.split('.');
    return { slideId, answerKey };
  },
};
