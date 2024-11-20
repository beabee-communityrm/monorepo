import {
  CalloutReviewerFilterName,
  calloutReviewerFilters
} from "@beabee/beabee-common";
import { CalloutReviewer } from "@beabee/core/models";
import { BaseTransformer } from "./BaseTransformer";
import { AuthInfo } from "@type/auth-info";
import {
  GetCalloutReviewerDto,
  ListCalloutReviewersDto
} from "@api/dto/CalloutReviewerDto";
import ContactTransformer from "./ContactTransformer";

class CalloutReviewerTransformer extends BaseTransformer<
  CalloutReviewer,
  GetCalloutReviewerDto,
  CalloutReviewerFilterName,
  ListCalloutReviewersDto
> {
  protected model = CalloutReviewer;
  protected filters = calloutReviewerFilters;

  convert(reviewer: CalloutReviewer, auth: AuthInfo): GetCalloutReviewerDto {
    return {
      id: reviewer.id,
      contact: ContactTransformer.convert(reviewer.contact, auth)
    };
  }

  protected async transformQuery(
    query: ListCalloutReviewersDto,
    auth: AuthInfo
  ): Promise<ListCalloutReviewersDto> {}
}

export default new CalloutReviewerTransformer();
