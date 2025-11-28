import { createQueryBuilder, getRepository } from '@beabee/core/database';
import { Contact, Email, EmailMailing } from '@beabee/core/models';
import EmailService from '@beabee/core/services/EmailService';
import {
  AuthInfo,
  ContactEmailTemplateId,
  EmailTemplateId,
  PreviewEmailOptions,
} from '@beabee/core/type';

import { CurrentAuth } from '@api/decorators/CurrentAuth';
import {
  CreateEmailDto,
  EmailPreviewDto,
  GetEmailDto,
  GetEmailTemplateInfoDto,
  ListEmailsDto,
  PreviewAdminEmailParams,
  PreviewEmailDto,
  PreviewGeneralEmailParams,
  UpdateEmailDto,
} from '@api/dto/EmailDto';
import { PaginatedDto } from '@api/dto/PaginatedDto';
import EmailTransformer from '@api/transformers/EmailTransformer';
import { plainToInstance } from 'class-transformer';
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
  Params,
  Post,
  Put,
  QueryParams,
} from 'routing-controllers';
import { IsNull } from 'typeorm';

@Authorized('admin')
@JsonController('/email')
export class EmailController {
  /**
   * List custom emails (not template overrides) with pagination
   */
  @Get('/')
  async listEmails(
    @CurrentAuth() auth: AuthInfo,
    @QueryParams() query: ListEmailsDto
  ): Promise<PaginatedDto<GetEmailDto>> {
    const queryBuilder = createQueryBuilder(Email, 'e')
      .where({ templateId: IsNull() }) // Only custom emails, not template overrides
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
   * Get all email templates with metadata including override status and subject
   */
  @Get('/templates')
  async getTemplates(): Promise<GetEmailTemplateInfoDto[]> {
    return await EmailService.getTemplatesWithInfo();
  }

  /**
   * Create a new custom email
   */
  @Post('/')
  async createEmail(
    @CurrentAuth() auth: AuthInfo,
    @Body() data: CreateEmailDto
  ): Promise<GetEmailDto> {
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
    @Param('id') id: EmailTemplateId | string
  ): Promise<GetEmailDto | undefined> {
    const email = await EmailService.findEmail(id);
    return email ? EmailTransformer.convert(email, auth) : undefined;
  }

  /**
   * Update an existing email or create/update a template override
   *
   * - For UUIDs: Updates the existing custom email
   * - For template IDs: Creates or updates a template override
   */
  @Put('/:id')
  async updateEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('id') id: EmailTemplateId | string,
    @Body() data: UpdateEmailDto
  ): Promise<GetEmailDto | undefined> {
    // Check if it's a template ID
    if (EmailService.isTemplateId(id)) {
      const updated = await EmailService.createOrUpdateTemplateOverride(id, {
        subject: data.subject,
        body: data.body,
      });
      return EmailTransformer.convert(updated, auth);
    }

    // Otherwise treat as UUID
    const email = await getRepository(Email).findOneBy({ id });
    if (!email) {
      throw new NotFoundError();
    }

    await getRepository(Email).update(id, data);
    const updated = await getRepository(Email).findOneBy({ id });
    return updated ? EmailTransformer.convert(updated, auth) : undefined;
  }

  /**
   * Delete an email or remove a template override (reset to default)
   *
   * - For UUIDs: Deletes the custom email and associated mailings
   * - For template IDs: Deletes the override (resets to default template)
   */
  @OnUndefined(204)
  @Delete('/:id')
  async deleteEmail(@Param('id') id: string): Promise<void> {
    // Check if it's a template ID
    if (EmailService.isTemplateId(id)) {
      const deleted = await EmailService.deleteTemplateOverride(
        id as EmailTemplateId
      );
      if (!deleted) {
        throw new NotFoundError('No override exists for this template');
      }
      return;
    }

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

      // Don't allow deleting template overrides via UUID
      if (email.templateId) {
        throw new BadRequestError(
          'Cannot delete template override by UUID. Use the template ID instead.'
        );
      }

      // Delete associated mailings first
      await getRepository(EmailMailing).delete({ emailId: id });
      // Delete the email
      await getRepository(Email).delete(id);
      return;
    }

    throw new NotFoundError();
  }

  @Post('/preview')
  async previewEmail(
    @CurrentUser({ required: true }) contact: Contact,
    @Body() data: PreviewEmailDto
  ): Promise<EmailPreviewDto> {
    return await this.getPreview(contact, data);
  }

  /**
   * Preview a general email template
   * Available to all authenticated users
   */
  @Authorized()
  @Post('/preview/general/:templateId')
  async previewGeneralEmail(
    @CurrentUser({ required: true }) contact: Contact,
    @Params() { templateId }: PreviewGeneralEmailParams,
    @Body() data: PreviewEmailDto
  ): Promise<EmailPreviewDto> {
    return await this.getPreview(contact, { ...data, templateId });
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
    @Param('templateId') templateId: ContactEmailTemplateId,
    @Body() data: PreviewEmailDto
  ): Promise<EmailPreviewDto> {
    return await this.getPreview(contact, { ...data, templateId });
  }

  /**
   * Preview an admin email template
   * Only available to administrators
   */
  @Authorized('admin')
  @Post('/preview/admin/:templateId')
  async previewAdminEmail(
    @CurrentUser({ required: true }) contact: Contact,
    @Params() { templateId }: PreviewAdminEmailParams,
    @Body() data: PreviewEmailDto
  ): Promise<EmailPreviewDto> {
    return await this.getPreview(contact, { ...data, templateId });
  }

  /**
   * Helper method to get email template preview and convert to DTO
   */
  private async getPreview(
    contact: Contact,
    data: PreviewEmailOptions
  ): Promise<EmailPreviewDto> {
    const ret = await EmailService.getPreview(contact, data);
    return plainToInstance(EmailPreviewDto, ret);
  }
}
