import config from '@beabee/core/config';
import { createQueryBuilder, getRepository } from '@beabee/core/database';
import { Contact, Email, EmailMailing } from '@beabee/core/models';
import EmailService from '@beabee/core/services/EmailService';
import OptionsService from '@beabee/core/services/OptionsService';
import { AuthInfo, EmailTemplateId } from '@beabee/core/type';

import { CurrentAuth } from '@api/decorators/CurrentAuth';
import {
  AssignTemplateDto,
  CreateEmailDto,
  GetEmailDto,
  GetEmailTemplateInfoDto,
  GetEmailWithMetadataDto,
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
  CurrentUser,
  Delete,
  Get,
  JsonController,
  NotFoundError,
  OnUndefined,
  Param,
  Post,
  Put,
  QueryParams,
} from 'routing-controllers';

@Authorized('admin')
@JsonController('/email')
export class EmailController {
  /**
   * List all emails with pagination
   */
  @Get('/')
  async listEmails(
    @CurrentAuth() auth: AuthInfo,
    @QueryParams() query: ListEmailsDto
  ): Promise<PaginatedDto<GetEmailWithMetadataDto>> {
    const queryBuilder = createQueryBuilder(Email, 'e')
      .loadRelationCountAndMap('e.mailingCount', 'e.mailings')
      .orderBy({ 'e.date': 'DESC' });

    // Apply pagination
    if (query.limit) {
      queryBuilder.take(query.limit);
    }
    if (query.offset) {
      queryBuilder.skip(query.offset);
    }

    const [emails, total] = await queryBuilder.getManyAndCount();

    return {
      items: emails.map((email) => EmailTransformer.convert(email, auth)),
      total,
      offset: query.offset || 0,
      count: emails.length,
    };
  }

  /**
   * Get available email templates with metadata
   * Uses centralized template definitions from email-templates.ts
   */
  @Get('/templates')
  async getTemplates(
    @CurrentAuth() auth: AuthInfo
  ): Promise<GetEmailTemplateInfoDto[]> {
    return EmailService.getAssignableTemplates();
  }

  /**
   * Assign a template to an email (for System Templates view)
   * Must be defined before all routes with :id to avoid route conflicts
   */
  @Put('/templates/:templateId')
  async assignTemplate(
    @Param('templateId') templateId: string,
    @Body() data: AssignTemplateDto
  ): Promise<void> {
    if (!EmailService.isTemplateId(templateId)) {
      throw new BadRequestError(`Invalid template ID: ${templateId}`);
    }

    const currentTemplates = OptionsService.getJSON('email-templates') || {};

    if (data.emailId === null) {
      // Remove assignment
      delete currentTemplates[templateId];
    } else {
      // Validate email exists
      const email = await getRepository(Email).findOneBy({ id: data.emailId });
      if (!email) {
        throw new NotFoundError('Email not found');
      }
      // Assign template
      currentTemplates[templateId] = data.emailId;
    }

    await OptionsService.setJSON('email-templates', currentTemplates);
  }

  /**
   * Create a new custom email
   */
  @Post('/')
  async createEmail(
    @CurrentAuth() auth: AuthInfo,
    @Body() data: CreateEmailDto
  ): Promise<GetEmailWithMetadataDto> {
    const email = await getRepository(Email).save({
      name: data.name,
      fromName: data.fromName || null,
      fromEmail: data.fromEmail || null,
      subject: data.subject,
      body: data.body,
    });

    return EmailTransformer.convert(email, auth);
  }

  @Get('/:id')
  async getEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('id') id: string
  ): Promise<GetEmailWithMetadataDto | undefined> {
    const email = await findEmail(id);
    return email ? EmailTransformer.convert(email, auth) : undefined;
  }

  /**
   * Update an existing email
   * Only accepts UUIDs (custom emails), not template IDs
   */
  @Put('/:id')
  async updateEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('id') id: string,
    @Body() data: UpdateEmailDto
  ): Promise<GetEmailWithMetadataDto | undefined> {
    const email = await getRepository(Email).findOneBy({ id });
    if (!email) {
      throw new NotFoundError();
    }

    await getRepository(Email).update(id, data);
    const updated = await getRepository(Email).findOneBy({ id });
    return updated ? EmailTransformer.convert(updated, auth) : undefined;
  }

  /**
   * Delete an email or remove a template override
   */
  @OnUndefined(204)
  @Delete('/:id')
  async deleteEmail(@Param('id') id: string): Promise<void> {
    // Check if it's a UUID (custom email)
    if (
      id.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    ) {
      const email = await getRepository(Email).findOneBy({ id });
      if (!email) {
        throw new NotFoundError();
      }

      // Remove all template mappings for this email
      const currentTemplates = OptionsService.getJSON('email-templates') || {};
      const updatedTemplates = Object.fromEntries(
        Object.entries(currentTemplates).filter(
          ([_, emailId]) => emailId !== id
        )
      );
      await OptionsService.setJSON('email-templates', updatedTemplates);

      // Delete associated mailings first
      await getRepository(EmailMailing).delete({ emailId: id });
      // Delete the email
      await getRepository(Email).delete(id);
    } else if (EmailService.isTemplateId(id)) {
      // Delete template override
      await EmailService.deleteTemplateEmail(id as EmailTemplateId);
    } else {
      throw new NotFoundError();
    }
  }

  /**
   * Preview a general email template
   * Available to all authenticated users
   */
  @Authorized()
  @Post('/preview/general/:templateId')
  async previewGeneralEmail(
    @CurrentUser({ required: true }) contact: Contact,
    @Param('templateId') templateId: string,
    @Body() data: PreviewEmailDto
  ): Promise<GetEmailDto> {
    return this.previewEmailTemplate(contact, templateId, data, 'general');
  }

  /**
   * Preview a contact email template
   * Available to all authenticated users
   * Uses the current user's data for contact-specific fields
   */
  @Authorized()
  @Post('/preview/contact/:templateId')
  async previewContactEmail(
    @CurrentUser({ required: true }) contact: Contact,
    @Param('templateId') templateId: string,
    @Body() data: PreviewEmailDto
  ): Promise<GetEmailDto> {
    return this.previewEmailTemplate(contact, templateId, data, 'contact');
  }

  /**
   * Preview an admin email template
   * Only available to administrators
   */
  @Authorized('admin')
  @Post('/preview/admin/:templateId')
  async previewAdminEmail(
    @CurrentUser({ required: true }) contact: Contact,
    @Param('templateId') templateId: string,
    @Body() data: PreviewEmailDto
  ): Promise<GetEmailDto> {
    return this.previewEmailTemplate(contact, templateId, data, 'admin');
  }

  /**
   * Shared logic for previewing email templates
   * Validates template ID and type, then generates preview with merge fields
   */
  private async previewEmailTemplate(
    contact: Contact,
    templateId: string,
    data: PreviewEmailDto,
    expectedType: 'general' | 'contact' | 'admin'
  ): Promise<GetEmailDto> {
    if (!EmailService.isTemplateId(templateId)) {
      throw new BadRequestError(`Invalid template ID: ${templateId}`);
    }

    const templateType = EmailService.getTemplateType(templateId);
    if (templateType !== expectedType) {
      throw new BadRequestError(
        `Template ${templateId} is not an ${expectedType} template`
      );
    }

    const preview = await EmailService.getTemplatePreview(
      templateId,
      expectedType,
      contact,
      data.mergeFields || {},
      {
        ...(data.customSubject && { customSubject: data.customSubject }),
        ...(data.locale && { locale: data.locale }),
        ...(data.body && { body: data.body }),
      }
    );

    return preview;
  }
}
