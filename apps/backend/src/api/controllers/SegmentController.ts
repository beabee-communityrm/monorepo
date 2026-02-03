import { getRepository } from '@beabee/core/database';
import {
  Contact,
  Segment,
  SegmentContact,
  SegmentOngoingEmail,
} from '@beabee/core/models';
import EmailService from '@beabee/core/services/EmailService';
import { AuthInfo } from '@beabee/core/type';

import { CurrentAuth } from '@api/decorators/CurrentAuth';
import PartialBody from '@api/decorators/PartialBody';
import { GetContactDto, ListContactsDto } from '@api/dto/ContactDto';
import { PaginatedDto } from '@api/dto/PaginatedDto';
import {
  CreateSegmentDto,
  GetSegmentDto,
  GetSegmentOptsDto,
  GetSegmentWith,
  ListSegmentsDto,
  SendSegmentEmailBodyDto,
} from '@api/dto/SegmentDto';
import { UUIDParams } from '@api/params/UUIDParams';
import ContactTransformer from '@api/transformers/ContactTransformer';
import SegmentTransformer from '@api/transformers/SegmentTransformer';
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
  QueryParams,
} from 'routing-controllers';

/** Chunk size for segment email send to limit memory use. */
const SEGMENT_EMAIL_PAGE_SIZE = 100;

@JsonController('/segments')
@Authorized('admin')
export class SegmentController {
  @Get('/')
  async getSegments(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @QueryParams() query: ListSegmentsDto
  ): Promise<GetSegmentDto[]> {
    const result = await SegmentTransformer.fetch(auth, query);
    return result.items; // TODO: return paginated
  }

  @Post('/')
  async createSegment(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Body() data: CreateSegmentDto
  ): Promise<GetSegmentDto> {
    // Default to inserting new segment at the bottom
    if (data.order === undefined) {
      const segments = await getRepository(Segment).find({
        select: { order: true },
        order: { order: 'DESC' },
        take: 1,
      });
      data.order = segments.length > 0 ? segments[0].order + 1 : 0;
    }
    const segment = await getRepository(Segment).save(data);

    // Use fetchOne to ensure that the segment has a itemCount
    return await SegmentTransformer.fetchOneByIdOrFail(auth, segment.id, {
      with: [GetSegmentWith.itemCount],
    });
  }

  @Get('/:id')
  async getSegment(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Params() { id }: UUIDParams,
    @QueryParams() opts: GetSegmentOptsDto
  ): Promise<GetSegmentDto | undefined> {
    return await SegmentTransformer.fetchOneById(auth, id, opts);
  }

  @Patch('/:id')
  async updateSegment(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Params() { id }: UUIDParams,
    @PartialBody() data: CreateSegmentDto
  ): Promise<GetSegmentDto | undefined> {
    await getRepository(Segment).update(id, data);
    return await SegmentTransformer.fetchOneById(auth, id, {
      with: [GetSegmentWith.itemCount],
    });
  }

  @Delete('/:id')
  @OnUndefined(204)
  async deleteSegment(@Params() { id }: UUIDParams): Promise<void> {
    await getRepository(SegmentContact).delete({ segment: { id } });
    await getRepository(SegmentOngoingEmail).delete({ segment: { id } });
    const result = await getRepository(Segment).delete(id);
    if (result.affected === 0) {
      throw new NotFoundError();
    }
  }

  @Get('/:id/contacts')
  async getSegmentContacts(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Params() { id }: UUIDParams,
    @QueryParams() query: ListContactsDto
  ): Promise<PaginatedDto<GetContactDto> | undefined> {
    const segment = await getRepository(Segment).findOneBy({ id });
    if (!segment) return undefined;
    return await ContactTransformer.fetchForSegment(
      auth,
      segment.ruleGroup,
      query
    );
  }

  /** One-off email to all contacts in the segment (chunked). */
  @OnUndefined(204)
  @Post('/:id/email/send')
  async sendEmail(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Params() { id }: UUIDParams,
    @Body() data: SendSegmentEmailBodyDto
  ): Promise<void> {
    const segment = await getRepository(Segment).findOneBy({ id });
    if (!segment) throw new NotFoundError();

    let offset = 0;
    while (true) {
      const { items } = await ContactTransformer.fetchRawForSegment(
        auth,
        segment.ruleGroup,
        { limit: SEGMENT_EMAIL_PAGE_SIZE, offset }
      );
      if (items.length === 0) break;
      await EmailService.sendCustomEmailToContact(
        items,
        data.subject,
        data.body
      );
      offset += items.length;
      if (items.length < SEGMENT_EMAIL_PAGE_SIZE) break;
    }
  }
}
