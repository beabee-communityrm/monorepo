import type { EmailTemplateType } from '@beabee/beabee-common';
import EmailService from '@beabee/core/services/EmailService';

import type { ValidationOptions } from 'class-validator';
import { ValidateBy, buildMessage } from 'class-validator';

export default function IsEmailTemplateId(
  type?: EmailTemplateType,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy({
    name: 'isEmailTemplateId',
    validator: {
      validate: (value) => {
        return EmailService.isTemplateId(value, type);
      },
      defaultMessage: buildMessage(
        (eachPrefix) =>
          eachPrefix + `$property must be a valid email template ID`,
        validationOptions
      ),
    },
  });
}
