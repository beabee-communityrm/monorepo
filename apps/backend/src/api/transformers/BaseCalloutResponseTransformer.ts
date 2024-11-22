import {
  CalloutResponseFilterName,
  calloutResponseFilters,
  Filters,
  getCalloutFilters,
  PaginatedQuery,
  RuleGroup,
  RuleOperator
} from "@beabee/beabee-common";

import { BaseGetCalloutResponseOptsDto } from "@api/dto/CalloutResponseDto";
import { BaseTransformer } from "@api/transformers/BaseTransformer";
import { mergeRules } from "@api/utils/rules";

import { CalloutResponse } from "@beabee/core/models";

import { AuthInfo } from "@type/auth-info";
import { FilterHandlers } from "@type/filter-handlers";
import calloutTagTransformer from "./CalloutTagTransformer";
import { getReviewerRules } from "@api/utils/callouts";

export abstract class BaseCalloutResponseTransformer<
  GetDto,
  GetOptsDto extends BaseGetCalloutResponseOptsDto
> extends BaseTransformer<
  CalloutResponse,
  GetDto,
  CalloutResponseFilterName,
  GetOptsDto
> {
  protected model = CalloutResponse;
  filters = calloutResponseFilters;
  filterHandlers = calloutResponseFilterHandlers;

  protected async transformFilters(
    query: GetOptsDto & PaginatedQuery
  ): Promise<
    [Partial<Filters<CalloutResponseFilterName>>, FilterHandlers<string>]
  > {
    return [
      // If looking for responses for a particular callout then add answer filtering
      query.callout ? getCalloutFilters(query.callout.formSchema) : {},
      {}
    ];
  }

  protected async getNonAdminAuthRules(
    auth: AuthInfo,
    query: GetOptsDto
  ): Promise<RuleGroup> {
    return {
      condition: "OR",
      rules: [
        // User's can always see their own responses
        { field: "contact", operator: "equal", value: ["me"] },
        // And any responses for callouts they are reviewers for
        ...(await getReviewerRules(auth.contact, "calloutId"))
      ]
    };
  }

  protected transformQuery<T extends GetOptsDto & PaginatedQuery>(query: T): T {
    return {
      ...query,
      rules: mergeRules([
        query.rules,
        // Only load responses for the given callout
        !!query.callout && {
          field: "calloutId",
          operator: "equal",
          value: [query.callout.id]
        }
      ])
    };
  }
}

// Arrays are actually {a: true, b: false} type objects in answers
const answerArrayOperators: Partial<
  Record<RuleOperator, (field: string) => string>
> = {
  contains: (field) => `(${field} -> :valueA)::boolean`,
  not_contains: (field) => `NOT (${field} -> :valueA)::boolean`,
  is_empty: (field) => `NOT jsonb_path_exists(${field}, '$.* ? (@ == true)')`,
  is_not_empty: (field) => `jsonb_path_exists(${field}, '$.* ? (@ == true)')`
};

export const calloutResponseFilterHandlers: FilterHandlers<string> = {
  tags: calloutTagTransformer.tagFilterHandler,
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
  "answers.": (qb, args) => {
    const answerField = `${args.fieldPrefix}answers -> :slideId -> :answerKey`;

    if (args.type === "array") {
      // Override operator function for array types
      const operatorFn = answerArrayOperators[args.operator];
      if (!operatorFn) {
        // Shouln't be able to happen as rule has been validated
        throw new Error("Invalid ValidatedRule");
      }
      qb.where(args.addParamSuffix(operatorFn(answerField)));
    } else if (
      args.operator === "is_empty" ||
      args.operator === "is_not_empty"
    ) {
      // is_empty and is_not_empty need special treatment for JSONB values
      const operator = args.operator === "is_empty" ? "IN" : "NOT IN";
      qb.where(
        args.addParamSuffix(
          `COALESCE(${answerField}, 'null') ${operator} ('null', '""')`
        )
      );
    } else if (args.type === "number" || args.type === "boolean") {
      // Cast from JSONB to native type for comparison
      const cast = args.type === "number" ? "numeric" : "boolean";
      qb.where(args.convertToWhereClause(`(${answerField})::${cast}`));
    } else {
      // Extract as text instead of JSONB (note ->> instead of ->)
      qb.where(
        args.convertToWhereClause(
          `${args.fieldPrefix}answers -> :slideId ->> :answerKey`
        )
      );
    }

    const [_, slideId, answerKey] = args.field.split(".");
    return { slideId, answerKey };
  }
};
