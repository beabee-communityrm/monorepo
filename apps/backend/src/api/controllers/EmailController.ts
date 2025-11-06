import config from '@beabee/core/config';
import { getRepository } from '@beabee/core/database';
import { Contact, Email } from '@beabee/core/models';
import EmailService from '@beabee/core/services/EmailService';
import { AuthInfo } from '@beabee/core/type';

import { CurrentAuth } from '@api/decorators/CurrentAuth';
import {
  GetEmailDto,
  PreviewEmailDto,
  UpdateEmailDto,
} from '@api/dto/EmailDto';
import EmailTransformer from '@api/transformers/EmailTransformer';
import { findEmail } from '@api/utils/email';
import {
  Authorized,
  BadRequestError,
  Body,
  CurrentUser,
  Get,
  JsonController,
  Param,
  Post,
  Put,
} from 'routing-controllers';

@Authorized('admin')
@JsonController('/email')
export class EmailController {
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
      }
    );

    return preview;
  }
}
