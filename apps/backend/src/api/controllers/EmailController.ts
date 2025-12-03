import { getRepository } from '@beabee/core/database';
import { Contact, Email, EmailMailing } from '@beabee/core/models';
import EmailService from '@beabee/core/services/EmailService';
import { AuthInfo, PreviewEmailOptions } from '@beabee/core/type';

import { CurrentAuth } from '@api/decorators/CurrentAuth';
import {
  CreateEmailDto,
  DeleteEmailTemplateParams,
  EmailPreviewDto,
  GetEmailDto,
  GetEmailTemplateInfoDto,
  GetEmailTemplateParams,
  ListEmailsDto,
  PreviewAdminEmailParams,
  PreviewContactEmailParams,
  PreviewEmailDto,
  PreviewGeneralEmailParams,
  UpdateEmailDto,
  UpdateEmailTemplateParams,
} from '@api/dto/EmailDto';
import { PaginatedDto } from '@api/dto/PaginatedDto';
import EmailTransformer from '@api/transformers/EmailTransformer';
import { plainToInstance } from 'class-transformer';
import {
  Authorized,
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
    return await EmailTransformer.fetch(auth, query);
  }

  /**
   * Get all email templates with metadata including override status and subject
   */
  @Get('/templates')
  async getTemplates(): Promise<GetEmailTemplateInfoDto[]> {
    return await EmailService.getTemplatesWithInfo();
  }

  /**
   * Get a template email (override or default)
   */
  @Get('/template/:templateId')
  async getTemplate(
    @CurrentAuth() auth: AuthInfo,
    @Params() { templateId }: GetEmailTemplateParams
  ): Promise<GetEmailDto> {
    const email = await EmailService.getTemplateEmail(templateId);
    if (!email) {
      throw new NotFoundError('Template not found');
    }
    return EmailTransformer.convert(email, auth);
  }

  /**
   * Create or update a template override
   */
  @Put('/template/:templateId')
  async updateTemplate(
    @CurrentAuth() auth: AuthInfo,
    @Params() { templateId }: UpdateEmailTemplateParams,
    @Body() data: UpdateEmailDto
  ): Promise<GetEmailDto> {
    const updated = await EmailService.createOrUpdateTemplateOverride(
      templateId,
      {
        subject: data.subject,
        body: data.body,
      }
    );

    return EmailTransformer.convert(updated, auth);
  }

  /**
   * Delete a template override (reset to default)
   */
  @OnUndefined(204)
  @Delete('/template/:templateId')
  async deleteTemplate(
    @Params() { templateId }: DeleteEmailTemplateParams
  ): Promise<void> {
    const deleted = await EmailService.deleteTemplateOverride(templateId);

    if (!deleted) {
      throw new NotFoundError('No override exists for this template');
    }
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

  /**
   * Get a custom email by UUID
   */
  @Get('/:id')
  async getEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('id') id: string
  ): Promise<GetEmailDto> {
    const email = await getRepository(Email).findOneBy({
      id,
      templateId: IsNull(), // Only custom emails
    });

    if (!email) {
      throw new NotFoundError();
    }

    return EmailTransformer.convert(email, auth);
  }

  /**
   * Update an existing custom email
   */
  @Put('/:id')
  async updateEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('id') id: string,
    @Body() data: UpdateEmailDto
  ): Promise<GetEmailDto> {
    const email = await getRepository(Email).findOneBy({
      id,
      templateId: IsNull(), // Only custom emails
    });

    if (!email) {
      throw new NotFoundError();
    }

    await getRepository(Email).update(id, data);
    const updated = await getRepository(Email).findOneBy({ id });

    if (!updated) {
      throw new NotFoundError();
    }

    return EmailTransformer.convert(updated, auth);
  }

  /**
   * Delete a custom email and its associated mailings
   */
  @OnUndefined(204)
  @Delete('/:id')
  async deleteEmail(@Param('id') id: string): Promise<void> {
    const email = await getRepository(Email).findOneBy({
      id,
      templateId: IsNull(), // Only custom emails
    });

    if (!email) {
      throw new NotFoundError();
    }

    // Delete associated mailings first
    await getRepository(EmailMailing).delete({ emailId: id });
    // Delete the email
    await getRepository(Email).delete(id);
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
    @Params() { templateId }: PreviewContactEmailParams,
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
