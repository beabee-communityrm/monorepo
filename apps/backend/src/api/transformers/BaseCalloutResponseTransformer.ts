import {
  CalloutResponseFilterName,
  Filters,
  PaginatedQuery,
  calloutResponseFilters,
  getCalloutFilters,
} from '@beabee/beabee-common';
import { calloutResponseFilterHandlers } from '@beabee/core/filter-handlers';
import { CalloutResponse } from '@beabee/core/models';
import { FilterHandlers } from '@beabee/core/type';

import { BaseGetCalloutResponseOptsDto } from '@api/dto/CalloutResponseDto';
import { BaseTransformer } from '@api/transformers/BaseTransformer';

export abstract class BaseCalloutResponseTransformer<
  GetDto,
  GetOptsDto extends BaseGetCalloutResponseOptsDto,
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
      {},
    ];
  }

  protected transformQuery<T extends GetOptsDto & PaginatedQuery>(query: T): T {
    if (query.callout) {
      return {
        ...query,
        rules: {
          condition: 'AND',
          rules: [
            // If a callout is specified, we need to filter by that callout's ID
            {
              field: 'calloutId',
              operator: 'equal',
              value: [query.callout.id],
            },
            query.rules,
          ],
        },
      };
    } else {
      return query;
    }
  }
}
