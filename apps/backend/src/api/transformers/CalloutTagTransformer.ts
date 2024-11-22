import { UnauthorizedError } from "routing-controllers";
import { GetCalloutTagDto } from "@api/dto";
import { mergeRules } from "@api/utils";
import {
  CalloutTagFilterName,
  Filters,
  calloutTagFilters,
  PaginatedQuery
} from "@beabee/beabee-common";
import { CalloutTag, CalloutResponseTag } from "@beabee/core/models";
import { AuthInfo } from "@type/auth-info";
import { getReviewerRules } from "@api/utils/callouts";
import BaseTagTransformer from "./BaseTagTransformer";

class CalloutTagTransformer extends BaseTagTransformer<
  CalloutTag,
  GetCalloutTagDto,
  CalloutTagFilterName
> {
  protected model = CalloutTag;
  protected filters: Filters<CalloutTagFilterName> = calloutTagFilters;
  protected dtoType = GetCalloutTagDto;
  protected assignmentModel = CalloutResponseTag;
  protected entityIdField = "responseId";

  protected async transformQuery<T extends PaginatedQuery>(
    query: T,
    auth: AuthInfo
  ): Promise<T> {
    if (auth.roles.includes("admin")) {
      return query;
    }

    const reviewerRules = auth.contact
      ? await getReviewerRules(auth.contact, "calloutId")
      : [];

    if (reviewerRules.length === 0) {
      throw new UnauthorizedError();
    }

    return {
      ...query,
      rules: mergeRules([
        query.rules,
        {
          condition: "OR",
          rules: reviewerRules
        }
      ])
    };
  }
}

export default new CalloutTagTransformer();
