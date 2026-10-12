import OptionsService from '@beabee/core/services/OptionsService';
import { getEmailDomain } from '@beabee/core/utils/email';

import {
  ValidateBy,
  ValidationOptions,
  buildMessage,
  isEmail,
} from 'class-validator';

export default function IsFromEmail(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy({
    name: 'isFromEmail',
    validator: {
      validate: (value: unknown) => {
        if (!value) {
          return true; // Allow null/undefined
        }

        if (typeof value !== 'string' || !isEmail(value)) {
          return false;
        }

        const supportDomain = getEmailDomain(
          OptionsService.getText('support-email')
        );
        const valueDomain = getEmailDomain(value);

        return valueDomain === supportDomain;
      },
      defaultMessage: buildMessage(
        (eachPrefix) =>
          eachPrefix +
          `$property must have the same domain as the support email`,
        validationOptions
      ),
    },
  });
}
