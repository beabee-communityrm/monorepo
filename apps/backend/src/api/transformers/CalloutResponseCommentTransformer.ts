import {
  CalloutResponseCommentFilterName,
  calloutResponseCommentFilters,
  RuleGroup
} from "@beabee/beabee-common";
import { TransformPlainToInstance } from "class-transformer";
import { SelectQueryBuilder } from "typeorm";

import { GetCalloutResponseCommentDto } from "@api/dto/CalloutResponseCommentDto";
import { BaseTransformer } from "@api/transformers/BaseTransformer";
import ContactTransformer, {
  loadContactRoles
} from "@api/transformers/ContactTransformer";

import {
  CalloutResponse,
  CalloutResponseComment,
  CalloutReviewer
} from "@beabee/core/models";

import { AuthInfo } from "@type/auth-info";
import { getReviewerRules } from "@api/utils/callouts";
import { FilterHandlers } from "@type/filter-handlers";
import { BadRequestError } from "routing-controllers";
import { createQueryBuilder } from "@beabee/core/database";

class CalloutResponseCommentTransformer extends BaseTransformer<
  CalloutResponseComment,
  GetCalloutResponseCommentDto,
  CalloutResponseCommentFilterName
> {
  protected model = CalloutResponseComment;
  protected filters = calloutResponseCommentFilters;
  protected filterHandlers: FilterHandlers<CalloutResponseCommentFilterName> = {
    calloutId: (qb, args) => {
      // calloutId is on the response rather than the comment
      qb.where(args.convertToWhereClause("response.calloutId"));
    }
  };

  @TransformPlainToInstance(GetCalloutResponseCommentDto)
  convert(
    comment: CalloutResponseComment,
    auth: AuthInfo
  ): GetCalloutResponseCommentDto {
    return {
      id: comment.id,
      contact: ContactTransformer.convert(comment.contact, auth),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      responseId: comment.responseId,
      text: comment.text
    };
  }

  protected async getNonAdminAuthRules(auth: AuthInfo): Promise<RuleGroup> {
    return {
      condition: "OR",
      rules: [
        // User's can always see their own response comments
        { field: "contact", operator: "equal", value: ["me"] },
        // And any comments for callouts they are reviewers for
        ...(await getReviewerRules(auth.contact, "calloutId"))
      ]
    };
  }

  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<CalloutResponseComment>,
    fieldPrefix: string
  ): void {
    qb.leftJoinAndSelect(`${fieldPrefix}contact`, "contact");

    // Fetch the calloutId for the response comment
    qb.leftJoin(`${fieldPrefix}response`, "response").addSelect(
      "response.calloutId",
      "calloutId"
    );
  }

  protected async modifyItems(
    comments: CalloutResponseComment[]
  ): Promise<void> {
    await loadContactRoles(comments.map((c) => c.contact));
  }

  /**
   * Checks if the user can create a comment by checking if they are a reviewer
   * for the callout
   *
   * @param auth The authentication info
   * @param data The comment data
   * @returns
   */
  protected async canCreate(
    auth: AuthInfo,
    data: Partial<CalloutResponseComment>
  ): Promise<boolean> {
    if (auth.roles.includes("admin")) {
      return true;
    }

    if (!data.responseId || !auth.contact) {
      throw new BadRequestError("Response ID and contact required");
    }

    const reviewer = await createQueryBuilder(CalloutReviewer, "reviewer")
      .select("1")
      .innerJoin(
        CalloutResponse,
        "response",
        "reviewer.calloutId = response.calloutId"
      )
      .where("reviewer.contactId = :contactId")
      .andWhere("response.id = :responseId")
      .setParameters({
        contactId: auth.contact.id,
        responseId: data.responseId
      })
      .getRawOne();

    return !!reviewer;
  }
}

export default new CalloutResponseCommentTransformer();
