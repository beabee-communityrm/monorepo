import {
  Authorized,
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

import { database, AuthInfo } from "@beabee/core";

import { CurrentAuth } from "#api/decorators/CurrentAuth";
import PartialBody from "#api/decorators/PartialBody";
import {
  CreateNoticeDto,
  GetNoticeDto,
  ListNoticesDto
} from "#api/dto/NoticeDto";
import { PaginatedDto } from "#api/dto/PaginatedDto";
import { UUIDParams } from "#api/params/UUIDParams";
import NoticeTransformer from "#api/transformers/NoticeTransformer";

import { Notice } from "@beabee/models";

@JsonController("/notice")
@Authorized()
export class NoticeController {
  @Get("/")
  async getNotices(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: ListNoticesDto
  ): Promise<PaginatedDto<GetNoticeDto>> {
    return await NoticeTransformer.fetch(auth, query);
  }

  @Get("/:id")
  async getNotice(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Params() { id }: UUIDParams
  ): Promise<GetNoticeDto | undefined> {
    return await NoticeTransformer.fetchOneById(auth, id);
  }

  @Post("/")
  @Authorized("admin")
  async createNotice(@Body() data: CreateNoticeDto): Promise<GetNoticeDto> {
    const notice = await database.getRepository(Notice).save(data);
    return NoticeTransformer.convert(notice);
  }

  @Patch("/:id")
  @Authorized("admin")
  async updateNotice(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Params() { id }: UUIDParams,
    @PartialBody() data: CreateNoticeDto
  ): Promise<GetNoticeDto | undefined> {
    await database.getRepository(Notice).update(id, data);
    return await NoticeTransformer.fetchOneById(auth, id);
  }

  @OnUndefined(204)
  @Delete("/:id")
  @Authorized("admin")
  async deleteNotice(@Params() { id }: UUIDParams): Promise<void> {
    const result = await database.getRepository(Notice).delete(id);
    if (!result.affected) throw new NotFoundError();
  }
}
