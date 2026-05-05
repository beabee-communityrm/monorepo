import { getRepository } from '@beabee/core/database';
import { NotFoundError } from '@beabee/core/errors';
import type { Contact } from '@beabee/core/models';
import {
  Email,
  EmailMailing,
  Segment,
  SegmentOngoingEmail,
} from '@beabee/core/models';
import EmailService from '@beabee/core/services/EmailService';
import SegmentService from '@beabee/core/services/SegmentService';
import type { AuthInfo } from '@beabee/core/type';

import {
  Authorized,
  Body,
  Delete,
  Get,
  JsonController,
  OnUndefined,
  Params,
  Patch,
  Post,
  QueryParams,
} from 'routing-controllers';

import { CurrentAuth } from '#api/decorators/CurrentAuth';
import PartialBody from '#api/decorators/PartialBody';
import type { GetContactDto, ListContactsDto } from '#api/dto/ContactDto';
import type { PaginatedDto } from '#api/dto/PaginatedDto';
import type {
  CreateSegmentDto,
  GetSegmentDto,
  GetSegmentOptsDto,
  ListSegmentsDto,
  SendSegmentEmailBodyDto,
} from '#api/dto/SegmentDto';
import { GetSegmentWith } from '#api/dto/SegmentDto';
import type { UUIDParams } from '#api/params/UUIDParams';
import ContactTransformer from '#api/transformers/ContactTransformer';
import SegmentTransformer from '#api/transformers/SegmentTransformer';

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
    await SegmentService.removeAllContactsFromSegment(id);
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
    const mergedRules = query.rules
      ? { condition: 'AND' as const, rules: [segment.ruleGroup, query.rules] }
      : segment.ruleGroup;
    return await ContactTransformer.fetch(auth, {
      ...query,
      rules: mergedRules,
    });
  }

  /** Send email to all contacts in the segment (admin). */
  @OnUndefined(204)
  @Post('/:id/email/send')
  async sendEmail(
    @CurrentAuth({ required: true }) auth: AuthInfo,
    @Params() { id }: UUIDParams,
    @Body() data: SendSegmentEmailBodyDto
  ): Promise<void> {
    const segment = await getRepository(Segment).findOneBy({ id });
    if (!segment) throw new NotFoundError();

    const { items: contacts } = await ContactTransformer.fetchRaw(auth, {
      rules: segment.ruleGroup,
      limit: -1,
    });
    if (contacts.length === 0) return;

    const contactList = contacts as Contact[];

    if (data.emailId) {
      await this.sendWithTemplate(contactList, data.emailId);
    } else {
      await EmailService.sendCustomEmailToContact(
        contactList,
        data.subject,
        data.body
      );
    }

    // Only track contacts when explicitly requested (i.e. initial send of
    // an ongoing email). Pure one-off sends must not pollute segment_contact,
    // otherwise contacts would be skipped by future ongoing emails.
    if (data.ongoingDirectSend) {
      await SegmentService.addContactsToSegment(
        id,
        contactList.map((c) => c.id)
      );
    }
  }

  /**
   * Send saved template to contacts and record EmailMailing for tracking.
   * sentDate is only set after a successful send; if sending throws, the mailing record stays without sentDate.
   *
   * @throws {NotFoundError} When the email template is not found
   * @throws Rethrows any error from EmailService.sendEmailToContact
   */
  private async sendWithTemplate(
    contacts: Contact[],
    emailId: string
  ): Promise<void> {
    const email = await getRepository(Email).findOneBy({ id: emailId });
    if (!email) throw new NotFoundError();

    const mailing = await getRepository(EmailMailing).save({
      emailId: email.id,
      recipients: contacts.map((c) => ({
        Email: c.email,
        Name: c.fullname,
        FirstName: c.firstname,
        LastName: c.lastname,
      })),
    });

    await EmailService.sendEmailToContact(email, contacts);
    await getRepository(EmailMailing).update(mailing.id, {
      sentDate: new Date(),
    });
  }
}
