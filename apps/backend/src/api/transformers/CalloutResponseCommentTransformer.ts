import {
  CalloutResponseCommentFilterName,
  calloutResponseCommentFilters,
  RuleGroup
} from "@beabee/beabee-common";
import { TransformPlainToInstance } from "class-transformer";
import { SelectQueryBuilder } from "typeorm";

import {
  GetCalloutResponseCommentDto,
  ListCalloutResponseCommentsDto
} from "@api/dto/CalloutResponseCommentDto";
import { BaseTransformer } from "@api/transformers/BaseTransformer";
import ContactTransformer, {
  loadContactRoles
} from "@api/transformers/ContactTransformer";
import { mergeRules } from "@api/utils/rules";

import { CalloutResponseComment } from "@beabee/core/models";

import { AuthInfo } from "@type/auth-info";
import { getReviewerRules } from "./BaseCalloutResponseTransformer";
import { FilterHandlers } from "@type/filter-handlers";

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

  protected async transformQuery<T extends ListCalloutResponseCommentsDto>(
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
}

async function getAuthRules(auth: AuthInfo): Promise<RuleGroup | undefined> {
  if (auth.roles.includes("admin")) {
    return;
  }

  return {
    condition: "OR",
    rules: [
      // User's can always see their own response comments
      { field: "contact", operator: "equal", value: ["me"] },
      // And any comments for callouts they are reviewers for
      ...(auth.contact ? await getReviewerRules(auth.contact, "calloutId") : [])
    ]
  };
}

export default new CalloutResponseCommentTransformer();
