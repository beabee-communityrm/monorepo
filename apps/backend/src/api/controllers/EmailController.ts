import { EmailTemplateType } from '@beabee/beabee-common';
import config from '@beabee/core/config';
import { getRepository } from '@beabee/core/database';
import { Contact, Email } from '@beabee/core/models';
import EmailService from '@beabee/core/services/EmailService';
import { AuthInfo } from '@beabee/core/type';

import { CurrentAuth } from '@api/decorators/CurrentAuth';
import {
  EmailPreviewDto,
  GetEmailDto,
  GetEmailListItemDto,
  ListEmailsDto,
  PreviewEmailDto,
  UpdateEmailDto,
} from '@api/dto/EmailDto';
import { GetEmailTemplatesMetadataDto } from '@api/dto/EmailTemplateMetadataDto';
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
    return await EmailTransformer.fetchList(auth, query);
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
      const updatedEmail = await findEmail(id);
      return updatedEmail
        ? EmailTransformer.convert(updatedEmail, auth)
        : undefined;
    } else if (EmailService.isTemplateId(id)) {
      const newEmail = await getRepository(Email).save({
        name: 'Email for ' + id,
        ...data,
      });
      await EmailService.setTemplateEmail(id, newEmail);
      return EmailTransformer.convert(newEmail, auth);
    }
  }

  /**
   * Get metadata for all email templates
   * Returns information about available merge fields and template purposes
   * Available to all authenticated users
   */
  @Authorized()
  @Get('/templates/metadata')
  async getTemplatesMetadata(): Promise<GetEmailTemplatesMetadataDto> {
    const templates = EmailService.getTemplatesMetadata().map((template) => ({
      ...template,
      type: template.type,
    }));
    return { templates };
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
  ): Promise<EmailPreviewDto> {
    if (!EmailService.isTemplateId(templateId)) {
      throw new BadRequestError(`Invalid template ID: ${templateId}`);
    }

    const templateType = EmailService.getTemplateType(templateId);
    if (templateType !== EmailTemplateType.General) {
      throw new BadRequestError(
        `Template ${templateId} is not a general template`
      );
    }

    const contact = auth.contact || (await this.getDefaultContact());

    const preview = await EmailService.getTemplatePreview(
      templateId,
      EmailTemplateType.General,
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
  ): Promise<EmailPreviewDto> {
    if (!EmailService.isTemplateId(templateId)) {
      throw new BadRequestError(`Invalid template ID: ${templateId}`);
    }

    const templateType = EmailService.getTemplateType(templateId);
    if (templateType !== EmailTemplateType.Contact) {
      throw new BadRequestError(
        `Template ${templateId} is not a contact template`
      );
    }

    const contact = auth.contact || (await this.getDefaultContact());

    const preview = await EmailService.getTemplatePreview(
      templateId,
      EmailTemplateType.Contact,
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
  ): Promise<EmailPreviewDto> {
    if (!EmailService.isTemplateId(templateId)) {
      throw new BadRequestError(`Invalid template ID: ${templateId}`);
    }

    const templateType = EmailService.getTemplateType(templateId);
    if (templateType !== EmailTemplateType.Admin) {
      throw new BadRequestError(
        `Template ${templateId} is not an admin template`
      );
    }

    // Admin templates use contact data for merge fields
    const contact = auth.contact || (await this.getDefaultContact());

    const preview = await EmailService.getTemplatePreview(
      templateId,
      EmailTemplateType.Admin,
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
