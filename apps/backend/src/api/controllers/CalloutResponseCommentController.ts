import {
  Authorized,
  BadRequestError,
  Body,
  Delete,
  Get,
  JsonController,
  NotFoundError,
  OnUndefined,
  Params,
  Patch,
  Post,
  QueryParams
} from "routing-controllers";

import { getRepository } from "@beabee/core/database";

import { CurrentAuth } from "@api/decorators/CurrentAuth";
import PartialBody from "@api/decorators/PartialBody";
import {
  CreateCalloutResponseCommentDto,
  GetCalloutResponseCommentDto,
  ListCalloutResponseCommentsDto
} from "@api/dto/CalloutResponseCommentDto";
import { PaginatedDto } from "@api/dto/PaginatedDto";
import { UUIDParams } from "@api/params/UUIDParams";

import CalloutResponseCommentTransformer from "@api/transformers/CalloutResponseCommentTransformer";

import { CalloutResponseComment } from "@beabee/core/models";

import { AuthInfo } from "@type/auth-info";

@JsonController("/callout-response-comments")
export class CalloutResponseCommentController {
  @Post("/")
  async createCalloutReponseComment(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Body() data: CreateCalloutResponseCommentDto
  ): Promise<GetCalloutResponseCommentDto> {
    if (!auth.contact) {
      throw new BadRequestError("Authentication with contact required");
    }

    // TODO: check auth here
    const comment: CalloutResponseComment = await getRepository(
      CalloutResponseComment
    ).save({
      contact: auth.contact,
      text: data.text,
      response: { id: data.responseId }
    });
    return CalloutResponseCommentTransformer.convert(comment, auth);
  }

  @Get("/")
  async getCalloutResponseComments(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: ListCalloutResponseCommentsDto
  ): Promise<PaginatedDto<GetCalloutResponseCommentDto>> {
    return await CalloutResponseCommentTransformer.fetch(auth, query);
  }

  @Get("/:id")
  async getCalloutResponseComment(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Params() { id }: UUIDParams
  ): Promise<GetCalloutResponseCommentDto | undefined> {
    return await CalloutResponseCommentTransformer.fetchOneById(auth, id);
  }

  @Patch("/:id")
  async updateCalloutResponseComment(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Params() { id }: UUIDParams,
    @PartialBody() data: CreateCalloutResponseCommentDto
  ): Promise<GetCalloutResponseCommentDto | undefined> {
    if (!(await CalloutResponseCommentTransformer.updateById(auth, id, data))) {
      throw new NotFoundError();
    }
    return await CalloutResponseCommentTransformer.fetchOneById(auth, id);
  }

  @OnUndefined(204)
  @Delete("/:id")
  async deleteCalloutResponseComment(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Params() { id }: UUIDParams
  ): Promise<void> {
    if (!(await CalloutResponseCommentTransformer.deleteById(auth, id))) {
      throw new NotFoundError();
    }
  }
}
