import config from '@beabee/core/config';
import { createQueryBuilder, getRepository } from '@beabee/core/database';
import { Contact, Email, SegmentOngoingEmail } from '@beabee/core/models';
import EmailService from '@beabee/core/services/EmailService';
import OptionsService from '@beabee/core/services/OptionsService';
import { AuthInfo } from '@beabee/core/type';

import { CurrentAuth } from '@api/decorators/CurrentAuth';
import {
  GetEmailDto,
  GetEmailListItemDto,
  ListEmailsDto,
  PreviewEmailDto,
  UpdateEmailDto,
} from '@api/dto/EmailDto';
import { PaginatedDto } from '@api/dto/PaginatedDto';
import EmailTransformer from '@api/transformers/EmailTransformer';
import { findEmail } from '@api/utils/email';
import {
  Authorized,
  BadRequestError,
  Body,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  QueryParams,
} from 'routing-controllers';

@Authorized('admin')
@JsonController('/email')
export class EmailController {
  /**
   * List all email templates with pagination
   * Returns both custom emails and metadata about system email overrides
   */
  @Get('/')
  async listEmails(
    @CurrentAuth() auth: AuthInfo,
    @QueryParams() query: ListEmailsDto
  ): Promise<PaginatedDto<GetEmailListItemDto>> {
    // Get all emails from database with mailing count
    const queryBuilder = createQueryBuilder(Email, 'e').loadRelationCountAndMap(
      'e.mailingCount',
      'e.mailings'
    );

    // Apply sorting
    const sortField = query.sort || 'name';
    const order = query.order || 'ASC';
    queryBuilder.orderBy(`e.${sortField}`, order);

    // Apply pagination
    const limit = query.limit || 50;
    const offset = query.offset || 0;
    queryBuilder.limit(limit).offset(offset);

    const emails = await queryBuilder.getMany();

    // Get system email template mappings
    const systemEmailMappings = OptionsService.getJSON('email-templates') || {};
    const systemEmailIds = Object.values(systemEmailMappings) as string[];

    // Get segment email mappings
    const segmentEmails = await getRepository(SegmentOngoingEmail).find();
    const segmentEmailIds = segmentEmails.map((se) => se.emailId);

    // Transform emails to list DTOs with flags
    const items: GetEmailListItemDto[] = emails.map((email) => ({
      id: email.id,
      name: email.name,
      subject: email.subject,
      date: email.date.toISOString(),
      mailingCount: (email.mailingCount as number) || 0,
      isSystem: systemEmailIds.includes(email.id),
      isSegment: segmentEmailIds.includes(email.id),
    }));

    // Get total count for pagination
    const total = await getRepository(Email).count();

    return {
      items,
      total,
      offset,
      count: items.length,
    };
  }

  @Get('/:id')
  async getEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('id') id: string
  ): Promise<GetEmailDto | undefined> {
    const email = await findEmail(id);
    return email ? EmailTransformer.convert(email, auth) : undefined;
  }

  @Put('/:id')
  async updateEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('id') id: string,
    @Body() data: UpdateEmailDto
  ): Promise<GetEmailDto | undefined> {
    const email = await findEmail(id);
    if (email) {
      await getRepository(Email).update(email.id, data);
      return data;
    } else if (EmailService.isTemplateId(id)) {
      const email = await getRepository(Email).save({
        name: 'Email for ' + id,
        ...data,
      });
      await EmailService.setTemplateEmail(id, email);
      return EmailTransformer.convert(email, auth);
    }
  }

  /**
   * Preview a general email template
   * Available to all authenticated users
   */
  @Authorized()
  @Post('/preview/general/:templateId')
  async previewGeneralEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('templateId') templateId: string,
    @Body() data: PreviewEmailDto
  ): Promise<GetEmailDto> {
    if (!EmailService.isTemplateId(templateId)) {
      throw new BadRequestError(`Invalid template ID: ${templateId}`);
    }

    const templateType = EmailService.getTemplateType(templateId);
    if (templateType !== 'general') {
      throw new BadRequestError(
        `Template ${templateId} is not a general template`
      );
    }

    const contact = auth.contact || (await this.getDefaultContact());

    const preview = await EmailService.getTemplatePreview(
      templateId,
      'general',
      contact,
      data.mergeFields || {},
      {
        ...(data.customSubject && { customSubject: data.customSubject }),
        ...(data.locale && { locale: data.locale }),
      }
    );

    return preview;
  }

  /**
   * Preview a contact email template
   * Available to all authenticated users
   * Uses the current user's data for contact-specific fields
   */
  @Authorized()
  @Post('/preview/contact/:templateId')
  async previewContactEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('templateId') templateId: string,
    @Body() data: PreviewEmailDto
  ): Promise<GetEmailDto> {
    if (!EmailService.isTemplateId(templateId)) {
      throw new BadRequestError(`Invalid template ID: ${templateId}`);
    }

    const templateType = EmailService.getTemplateType(templateId);
    if (templateType !== 'contact') {
      throw new BadRequestError(
        `Template ${templateId} is not a contact template`
      );
    }

    const contact = auth.contact || (await this.getDefaultContact());

    const preview = await EmailService.getTemplatePreview(
      templateId,
      'contact',
      contact,
      data.mergeFields || {},
      {
        ...(data.customSubject && { customSubject: data.customSubject }),
        ...(data.locale && { locale: data.locale }),
      }
    );

    return preview;
  }

  /**
   * Preview an admin email template
   * Only available to administrators
   */
  @Authorized('admin')
  @Post('/preview/admin/:templateId')
  async previewAdminEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('templateId') templateId: string,
    @Body() data: PreviewEmailDto
  ): Promise<GetEmailDto> {
    if (!EmailService.isTemplateId(templateId)) {
      throw new BadRequestError(`Invalid template ID: ${templateId}`);
    }

    const templateType = EmailService.getTemplateType(templateId);
    if (templateType !== 'admin') {
      throw new BadRequestError(
        `Template ${templateId} is not an admin template`
      );
    }

    // Admin templates use contact data for merge fields
    const contact = auth.contact || (await this.getDefaultContact());

    const preview = await EmailService.getTemplatePreview(
      templateId,
      'admin',
      contact,
      data.mergeFields || {},
      {
        ...(data.customSubject && { customSubject: data.customSubject }),
        ...(data.locale && { locale: data.locale }),
      }
    );

    return preview;
  }

  /**
   * Get a default contact for preview purposes when auth.contact is not available
   * This should rarely happen since endpoints are @Authorized()
   */
  private async getDefaultContact(): Promise<Contact> {
    // Create a sample contact with default values for preview
    const contact = new Contact();
    contact.email = 'beispiel@example.com';
    contact.firstname = 'Max';
    contact.lastname = 'Mustermann';
    return contact;
  }
}
