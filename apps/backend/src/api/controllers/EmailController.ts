import { getRepository } from '@beabee/core/database';
import { Contact, Email } from '@beabee/core/models';
import EmailService from '@beabee/core/services/EmailService';
import {
  AuthInfo,
  ContactEmailTemplateId,
  EmailTemplateId,
  PreviewEmailOptions,
} from '@beabee/core/type';

import { CurrentAuth } from '@api/decorators/CurrentAuth';
import {
  GetEmailDto,
  PreviewAdminEmailParams,
  PreviewEmailDto,
  PreviewGeneralEmailParams,
  UpdateEmailDto,
} from '@api/dto/EmailDto';
import EmailTransformer from '@api/transformers/EmailTransformer';
import { plainToInstance } from 'class-transformer';
import {
  Authorized,
  Body,
  CurrentUser,
  Get,
  JsonController,
  Param,
  Params,
  Post,
  Put,
} from 'routing-controllers';

@Authorized('admin')
@JsonController('/email')
export class EmailController {
  @Get('/:id')
  async getEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('id') id: EmailTemplateId | string
  ): Promise<GetEmailDto | undefined> {
    const email = await EmailService.findEmail(id);
    return email ? EmailTransformer.convert(email, auth) : undefined;
  }

  @Put('/:id')
  async updateEmail(
    @CurrentAuth() auth: AuthInfo,
    @Param('id') id: EmailTemplateId | string,
    @Body() data: UpdateEmailDto
  ): Promise<GetEmailDto | undefined> {
    const email = await EmailService.findEmail(id);
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

  @Post('/preview')
  async previewEmail(
    @CurrentUser({ required: true }) contact: Contact,
    @Body() data: PreviewEmailDto
  ): Promise<GetEmailDto> {
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
  ): Promise<GetEmailDto> {
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
  ): Promise<GetEmailDto> {
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
  ): Promise<GetEmailDto> {
    return await this.getPreview(contact, { ...data, templateId });
  }

  /**
   * Helper method to get email template preview and convert to DTO
   */
  private async getPreview(
    contact: Contact,
    data: PreviewEmailOptions
  ): Promise<GetEmailDto> {
    const ret = await EmailService.getPreview(contact, data);
    return plainToInstance(GetEmailDto, ret);
  }
}
