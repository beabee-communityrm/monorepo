import { Email } from '@beabee/core/models';
import { AuthInfo } from '@beabee/core/type';

import { GetEmailDto } from '@api/dto/EmailDto';
import { TransformPlainToInstance } from 'class-transformer';

import { BaseTransformer } from './BaseTransformer';

class EmailTransformer extends BaseTransformer<Email, GetEmailDto> {
  protected model = Email;
  protected filters = {};

  @TransformPlainToInstance(GetEmailDto)
  convert(email: Email, auth: AuthInfo): GetEmailDto {
    return {
      subject: email.subject,
      body: email.body,
    };
  }
}

export default new EmailTransformer();
