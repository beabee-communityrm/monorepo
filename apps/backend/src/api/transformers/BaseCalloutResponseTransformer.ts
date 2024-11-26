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
import { mergeRules } from "@beabee/core/utils/rules";

import { CalloutResponse } from "@beabee/core/models";

import { AuthInfo, FilterHandlers } from "@beabee/core/type";
import { calloutResponseFilterHandlers } from "@beabee/core/filter-handlers";
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
