import { Email } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { GetEmailDto } from '@api/dto/EmailDto';
import { TransformPlainToInstance } from 'class-transformer';

import { BaseTransformer } from './BaseTransformer';

class EmailTransformer extends BaseTransformer<Email, GetEmailDto> {
  protected model = Email;
  protected filters = {};

  /**
   * Convert email to DTO with full metadata
   * @param email Email entity
   * @param auth Authentication info
   * @returns Email DTO with metadata
   */
  @TransformPlainToInstance(GetEmailDto)
  convert(email: Email, auth: AuthInfo): GetEmailDto {
    return {
      id: email.id,
      ...(email.templateId && { templateId: email.templateId }),
      name: email.name,
      fromName: email.fromName,
      fromEmail: email.fromEmail,
      subject: email.subject,
      body: email.body,
      date: email.date.toISOString(),
      mailingCount: email.mailingCount || 0,
    };
  }
}

export default new EmailTransformer();
