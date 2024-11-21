import {
  CalloutResponseFilterName,
  calloutResponseFilters,
  Filters,
  getCalloutFilters,
  PaginatedQuery,
  RuleOperator
} from "@beabee/beabee-common";

import { BaseGetCalloutResponseOptsDto } from "@api/dto/CalloutResponseDto";
import { BaseTransformer } from "@api/transformers/BaseTransformer";
import { mergeRules } from "@beabee/core/utils/rules";

import { CalloutResponse } from "@beabee/core/models";

import { AuthInfo, FilterHandlers } from "@beabee/core/type";
import { calloutResponseFilterHandlers } from "@beabee/core/filter-handlers";

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

  protected transformQuery<T extends GetOptsDto & PaginatedQuery>(
    query: T,
    auth: AuthInfo | undefined
  ): T {
    return {
      ...query,
      rules: mergeRules([
        query.rules,
        // Non admins can only see their own responses
        !auth?.roles.includes("admin") && {
          field: "contact",
          operator: "equal",
          value: ["me"]
        },
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
