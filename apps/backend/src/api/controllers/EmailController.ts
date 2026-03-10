import { Contact } from '@beabee/core/models';
import ContactsService from '@beabee/core/services/ContactsService';
import EmailService from '@beabee/core/services/EmailService';
import { AuthInfo, PreviewEmailOptions } from '@beabee/core/type';

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

import { CurrentAuth } from '#api/decorators/CurrentAuth';
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
} from '#api/dto/EmailDto';
import { PaginatedDto } from '#api/dto/PaginatedDto';
import EmailTransformer from '#api/transformers/EmailTransformer';

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
    @Params() { templateId }: GetEmailTemplateParams
  ): Promise<GetEmailDto> {
    const email = await EmailService.getTemplateEmail(templateId);
    if (!email) {
      throw new NotFoundError('Template not found');
    }
    return EmailTransformer.convert(email);
  }

  /**
   * Create or update a template override
   */
  @Put('/template/:templateId')
  async updateTemplate(
    @Params() { templateId }: UpdateEmailTemplateParams,
    @Body() data: UpdateEmailDto
  ): Promise<GetEmailDto> {
    const updated = await EmailService.createOrUpdateTemplateOverride(
      templateId,
      data
    );

    return EmailTransformer.convert(updated);
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
      throw new NotFoundError();
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
    return await EmailTransformer.createOne(auth, data);
  }

  /**
   * Get a custom email by UUID
   */
  @Get('/:id')
  async getEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('id') id: string
  ): Promise<GetEmailDto | undefined> {
    return await EmailTransformer.fetchOneById(auth, id);
  }

  /**
   * Update an existing custom email
   */
  @Put('/:id')
  async updateEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('id') id: string,
    @Body() data: UpdateEmailDto
  ): Promise<GetEmailDto | undefined> {
    if (!(await EmailTransformer.updateById(auth, id, data))) {
      throw new NotFoundError();
    }
    return await EmailTransformer.fetchOneById(auth, id);
  }

  /**
   * Delete a custom email and its associated mailings
   */
  @OnUndefined(204)
  @Delete('/:id')
  async deleteEmail(@Param('id') id: string): Promise<void> {
    if (!(await EmailService.deleteEmail(id))) {
      throw new NotFoundError();
    }
  }

  /**
   * Preview email using subject, body and optional mergeFields from the request.
   * When contactId is set (admin), merge fields use that contact; otherwise the current user.
   */
  @Post('/preview')
  async previewEmail(
    @CurrentUser({ required: true }) currentUser: Contact,
    @Body() data: PreviewEmailDto
  ): Promise<EmailPreviewDto> {
    const contact = data.contactId
      ? await ContactsService.findOneBy({ id: data.contactId })
      : currentUser;
    if (!contact) throw new NotFoundError('Contact not found');
    const { contactId: _, ...opts } = data;
    return await this.getPreview(contact, opts);
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
