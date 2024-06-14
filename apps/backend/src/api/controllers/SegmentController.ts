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
import { GetContactDto, ListContactsDto } from "#api/dto/ContactDto";
import {
  GetSegmentDto,
  ListSegmentsDto,
  CreateSegmentDto,
  GetSegmentWith,
  GetSegmentOptsDto
} from "#api/dto/SegmentDto";
import { PaginatedDto } from "#api/dto/PaginatedDto";
import { UUIDParams } from "#api/params/UUIDParams";
import ContactTransformer from "#api/transformers/ContactTransformer";
import SegmentTransformer from "#api/transformers/SegmentTransformer";

import { Segment, SegmentContact, SegmentOngoingEmail } from "@beabee/models";

@JsonController("/segments")
@Authorized("admin")
export class SegmentController {
  @Get("/")
  async getSegments(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: ListSegmentsDto
  ): Promise<GetSegmentDto[]> {
    const result = await SegmentTransformer.fetch(auth, query);
    return result.items; // TODO: return paginated
  }

  @Post("/")
  async createSegment(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Body() data: CreateSegmentDto
  ): Promise<GetSegmentDto> {
    // Default to inserting new segment at the bottom
    if (data.order === undefined) {
      const segments = await database.getRepository(Segment).find({
        select: { order: true },
        order: { order: "DESC" },
        take: 1
      });
      data.order = segments.length > 0 ? segments[0].order + 1 : 0;
    }
    const segment = await database.getRepository(Segment).save(data);

    // Use fetchOne to ensure that the segment has a contactCount
    return await SegmentTransformer.fetchOneByIdOrFail(auth, segment.id, {
      with: [GetSegmentWith.contactCount]
    });
  }

  @Get("/:id")
  async getSegment(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Params() { id }: UUIDParams,
    @QueryParams() opts: GetSegmentOptsDto
  ): Promise<GetSegmentDto | undefined> {
    return await SegmentTransformer.fetchOneById(auth, id, opts);
  }

  @Patch("/:id")
  async updateSegment(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Params() { id }: UUIDParams,
    @PartialBody() data: CreateSegmentDto
  ): Promise<GetSegmentDto | undefined> {
    await database.getRepository(Segment).update(id, data);
    return await SegmentTransformer.fetchOneById(auth, id, {
      with: [GetSegmentWith.contactCount]
    });
  }

  @Delete("/:id")
  @OnUndefined(204)
  async deleteSegment(@Params() { id }: UUIDParams): Promise<void> {
    await database.getRepository(SegmentContact).delete({ segment: { id } });
    await database
      .getRepository(SegmentOngoingEmail)
      .delete({ segment: { id } });
    const result = await database.getRepository(Segment).delete(id);
    if (result.affected === 0) {
      throw new NotFoundError();
    }
  }

  @Get("/:id/contacts")
  async getSegmentContacts(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Params() { id }: UUIDParams,
    @QueryParams() query: ListContactsDto
  ): Promise<PaginatedDto<GetContactDto> | undefined> {
    const segment = await database.getRepository(Segment).findOneBy({ id });
    if (segment) {
      return await ContactTransformer.fetch(auth, {
        ...query,
        rules: query.rules
          ? {
              condition: "AND",
              rules: [segment.ruleGroup, query.rules]
            }
          : segment.ruleGroup
      });
    }
  }
}
