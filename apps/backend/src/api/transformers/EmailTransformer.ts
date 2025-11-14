import { Email } from '@beabee/core/models';
import { optionsService } from '@beabee/core/services/OptionsService';
import { AuthInfo } from '@beabee/core/type';

import { GetEmailWithMetadataDto } from '@api/dto/EmailDto';
import { TransformPlainToInstance } from 'class-transformer';

import { BaseTransformer } from './BaseTransformer';

class EmailTransformer extends BaseTransformer<Email, GetEmailWithMetadataDto> {
  protected model = Email;
  protected filters = {};

  /**
   * Convert email to DTO with full metadata
   * @param email Email entity
   * @param auth Authentication info
   * @returns Email DTO with metadata including assigned templates
   */
  @TransformPlainToInstance(GetEmailWithMetadataDto)
  convert(email: Email, auth: AuthInfo): GetEmailWithMetadataDto {
    const emailTemplates = optionsService.getJSON('email-templates') || {};
    const assignedTemplates = Object.entries(emailTemplates)
      .filter(([_, emailId]) => emailId === email.id)
      .map(([templateId]) => templateId);

    return {
      id: email.id,
      name: email.name,
      fromName: email.fromName,
      fromEmail: email.fromEmail,
      subject: email.subject,
      body: email.body,
      date: email.date.toISOString(),
      assignedTemplates,
      mailingCount: email.mailingCount || 0,
    };
  }
}

export default new EmailTransformer();
