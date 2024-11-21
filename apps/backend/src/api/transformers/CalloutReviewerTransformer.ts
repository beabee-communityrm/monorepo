import {
  CalloutReviewerFilterName,
  calloutReviewerFilters,
  PaginatedQuery,
  RuleGroup
} from "@beabee/beabee-common";
import { CalloutReviewer } from "@beabee/core/models";
import { BaseTransformer } from "./BaseTransformer";
import { AuthInfo } from "@type/auth-info";
import {
  GetCalloutReviewerDto,
  ListCalloutReviewersDto
} from "@api/dto/CalloutReviewerDto";
import ContactTransformer, { loadContactRoles } from "./ContactTransformer";
import { getReviewerRules } from "./BaseCalloutResponseTransformer";
import { UnauthorizedError } from "@beabee/core/errors";
import { mergeRules } from "@api/utils";
import { SelectQueryBuilder } from "typeorm";

class CalloutReviewerTransformer extends BaseTransformer<
  CalloutReviewer,
  GetCalloutReviewerDto,
  CalloutReviewerFilterName
> {
  protected model = CalloutReviewer;
  protected filters = calloutReviewerFilters;

  convert(reviewer: CalloutReviewer, auth: AuthInfo): GetCalloutReviewerDto {
    return {
      id: reviewer.id,
      contact: ContactTransformer.convert(reviewer.contact, auth)
    };
  }

  protected async transformQuery<T extends ListCalloutReviewersDto>(
    query: T,
    auth: AuthInfo
  ): Promise<T> {
    const authRules = await getAuthRules(auth);

    return {
      ...query,
      rules: mergeRules([query.rules, authRules])
    };
  }

  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<CalloutReviewer>,
    fieldPrefix: string
  ): void {
    qb.innerJoinAndSelect(`${fieldPrefix}contact`, "contact");
  }

  protected async modifyItems(items: CalloutReviewer[]): Promise<void> {
    await loadContactRoles(items.map((i) => i.contact));
  }
}

async function getAuthRules(auth: AuthInfo): Promise<RuleGroup | undefined> {
  if (auth.roles.includes("admin")) {
    return;
  }

  const reviewerRules = auth.contact
    ? await getReviewerRules(auth.contact, "calloutId")
    : [];

  if (!reviewerRules.length) {
    throw new UnauthorizedError();
  }

  return { condition: "OR", rules: reviewerRules };
}

export default new CalloutReviewerTransformer();
