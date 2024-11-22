import { TransformPlainToInstance } from "class-transformer";
import { SelectQueryBuilder } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";

import { createQueryBuilder, getRepository } from "@beabee/core/database";

import {
  BatchUpdateCalloutResponseDto,
  GetCalloutResponseDto,
  GetCalloutResponseOptsDto,
  GetCalloutResponseWith,
  ListCalloutResponsesDto,
  UpdateCalloutResponseDto
} from "@api/dto/CalloutResponseDto";
import { PaginatedDto } from "@api/dto/PaginatedDto";
import { NotFoundError } from "@beabee/core/errors";
import ContactTransformer, {
  loadContactRoles
} from "@api/transformers/ContactTransformer";
import { BaseCalloutResponseTransformer } from "@api/transformers/BaseCalloutResponseTransformer";
import CalloutTransformer from "@api/transformers/CalloutTransformer";
import CalloutResponseCommentTransformer from "@api/transformers/CalloutResponseCommentTransformer";
import { batchUpdate } from "@api/utils";

import {
  Callout,
  CalloutResponse,
  CalloutResponseComment,
  CalloutResponseTag,
  Contact
} from "@beabee/core/models";

import { AuthInfo } from "@type/auth-info";
import calloutTagTransformer from "./CalloutTagTransformer";

export class CalloutResponseTransformer extends BaseCalloutResponseTransformer<
  GetCalloutResponseDto,
  GetCalloutResponseOptsDto
> {
  @TransformPlainToInstance(GetCalloutResponseDto)
  convert(
    response: CalloutResponse,
    auth: AuthInfo,
    opts: GetCalloutResponseOptsDto
  ): GetCalloutResponseDto {
    return {
      id: response.id,
      number: response.number,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      bucket: response.bucket,
      guestName: response.guestName,
      guestEmail: response.guestEmail,
      ...(opts.with?.includes(GetCalloutResponseWith.Answers) && {
        answers: response.answers
      }),
      ...(opts.with?.includes(GetCalloutResponseWith.Assignee) && {
        assignee:
          response.assignee &&
          ContactTransformer.convert(response.assignee, auth)
      }),
      ...(opts.with?.includes(GetCalloutResponseWith.Callout) && {
        callout: CalloutTransformer.convert(response.callout, auth)
      }),
      ...(opts.with?.includes(GetCalloutResponseWith.Contact) && {
        contact:
          response.contact && ContactTransformer.convert(response.contact, auth)
      }),
      ...(opts.with?.includes(GetCalloutResponseWith.LatestComment) && {
        latestComment:
          response.latestComment &&
          CalloutResponseCommentTransformer.convert(
            response.latestComment,
            auth
          )
      }),
      ...(opts.with?.includes(GetCalloutResponseWith.Tags) &&
        response.tags && {
          tags: response.tags.map((rt) => calloutTagTransformer.convert(rt.tag))
        })
    };
  }

  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<CalloutResponse>,
    fieldPrefix: string,
    query: ListCalloutResponsesDto,
    auth: AuthInfo
  ): void {
    // TODO: Add auth check for assignee
    if (query.with?.includes(GetCalloutResponseWith.Assignee)) {
      qb.leftJoinAndSelect(`${fieldPrefix}assignee`, "assignee");
    }
    if (query.with?.includes(GetCalloutResponseWith.Callout)) {
      qb.innerJoinAndSelect(`${fieldPrefix}callout`, "callout");
      qb.innerJoinAndSelect(
        "callout.variants",
        "variant",
        "variant.name = 'default'"
      );
    }
    if (
      query.with?.includes(GetCalloutResponseWith.Contact) &&
      auth.roles.includes("admin")
    ) {
      qb.leftJoinAndSelect(`${fieldPrefix}contact`, "contact");
    }
  }

  protected async modifyItems(
    responses: CalloutResponse[],
    query: ListCalloutResponsesDto
  ): Promise<void> {
    if (responses.length > 0) {
      const responseIds = responses.map((r) => r.id);

      if (query.with?.includes(GetCalloutResponseWith.LatestComment)) {
        const comments = await createQueryBuilder(CalloutResponseComment, "c")
          .distinctOn(["c.response"])
          .where("c.response IN (:...ids)", { ids: responseIds })
          .leftJoinAndSelect("c.contact", "contact")
          .orderBy({ "c.response": "ASC", "c.createdAt": "DESC" })
          .getMany();

        for (const response of responses) {
          response.latestComment =
            comments.find((c) => c.responseId === response.id) || null;
        }
      }

      // Load contact roles after to ensure offset/limit work
      const contacts = responses
        .flatMap((response) => [
          response.contact,
          response.assignee,
          response.latestComment?.contact
        ])
        .filter((c): c is Contact => !!c);
      await loadContactRoles(contacts);

      if (query.with?.includes(GetCalloutResponseWith.Tags)) {
        // Load tags after to ensure offset/limit work
        await calloutTagTransformer.loadEntityTags(responses);
      }
    }
  }

  async fetchForCallout(
    auth: AuthInfo,
    calloutId: string,
    query: ListCalloutResponsesDto
  ): Promise<PaginatedDto<GetCalloutResponseDto>> {
    const callout = await getRepository(Callout).findOneBy({ id: calloutId });
    if (!callout) {
      throw new NotFoundError();
    }
    return await this.fetch(auth, { ...query, callout });
  }

  async updateWithTags(
    auth: AuthInfo,
    query_: BatchUpdateCalloutResponseDto
  ): Promise<number> {
    const { query, filters, filterHandlers } = await this.preFetch(
      query_,
      auth
    );

    const { tagUpdates, responseUpdates } = getUpdateData(query.updates);
    const result = await batchUpdate(
      this.model,
      filters,
      query.rules,
      responseUpdates,
      auth.contact,
      filterHandlers,
      (qb) => qb.returning(["id"])
    );

    const responses: { id: string }[] = result.raw;

    if (tagUpdates) {
      await calloutTagTransformer.updateEntityTags(
        responses.map((r) => r.id),
        tagUpdates,
        CalloutResponseTag,
        "response"
      );
    }

    return result.affected || -1;
  }

  async updateWithTagsById(
    auth: AuthInfo,
    id: string,
    updates: UpdateCalloutResponseDto
  ): Promise<boolean> {
    const query: BatchUpdateCalloutResponseDto = {
      rules: {
        condition: "AND",
        rules: [{ field: this.modelIdField, operator: "equal", value: [id] }]
      },
      updates
    };
    const affected = await this.updateWithTags(auth, query);
    return affected !== 0;
  }
}

function getUpdateData(data: UpdateCalloutResponseDto): {
  tagUpdates: string[] | undefined;
  responseUpdates: QueryDeepPartialEntity<CalloutResponse>;
} {
  console.log("getUpdateData", data);
  const { tags: tagUpdates, assigneeId, ...otherUpdates } = data;
  return {
    tagUpdates,
    responseUpdates: {
      ...otherUpdates,
      ...(assigneeId !== undefined && {
        assignee: assigneeId ? { id: assigneeId } : null
      })
    }
  };
}

export default new CalloutResponseTransformer();
