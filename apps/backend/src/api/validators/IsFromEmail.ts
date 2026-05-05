import OptionsService from '@beabee/core/services/OptionsService';

import type { ValidationOptions } from 'class-validator';
import { ValidateBy, buildMessage, isEmail } from 'class-validator';

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

        const supportEmail = OptionsService.getText('support-email');
        const supportDomain = supportEmail.split('@')[1];
        const valueDomain = value.split('@')[1];

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
