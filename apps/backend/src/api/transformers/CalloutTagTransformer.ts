import { BadRequestError, UnauthorizedError } from "routing-controllers";
import { GetCalloutTagDto } from "@api/dto";
import {
  CalloutTagFilterName,
  Filters,
  calloutTagFilters,
  RuleGroup
} from "@beabee/beabee-common";
import {
  CalloutTag,
  CalloutResponseTag,
  CalloutReviewer
} from "@beabee/core/models";
import { AuthInfo } from "@type/auth-info";
import { getReviewerRules } from "@api/utils/callouts";
import BaseTagTransformer from "./BaseTagTransformer";
import { getRepository } from "@beabee/core/database";

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

  protected async getNonAdminAuthRules(
    auth: AuthInfo
  ): Promise<RuleGroup | false> {
    const reviewerRules = await getReviewerRules(auth.contact, "calloutId");
    if (reviewerRules.length) {
      return {
        condition: "OR",
        rules: reviewerRules
      };
    }

    return false;
  }

  protected async canCreate(
    auth: AuthInfo,
    data: Partial<CalloutTag>
  ): Promise<boolean> {
    if (auth.roles.includes("admin")) {
      return true;
    }

    if (!data.calloutId || !auth.contact) {
      throw new BadRequestError("Callout ID and contact required");
    }

    const reviewer = await getRepository(CalloutReviewer).findOneBy({
      contactId: auth.contact.id,
      calloutId: data.calloutId
    });

    return !!reviewer;
  }
}

export default new CalloutTagTransformer();
