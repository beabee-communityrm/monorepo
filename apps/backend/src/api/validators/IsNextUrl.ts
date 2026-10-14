import config from '@beabee/core/config';
import { isAllowedReturnUrl, isValidNextUrl } from '@beabee/core/utils/url';

import { ValidateBy, ValidationOptions, buildMessage } from 'class-validator';

/**
 * An internal path to continue to after login, or an absolute URL on a
 * trusted origin
 */
export default function IsNextUrl(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isNextUrl',
      validator: {
        validate(value) {
          return (
            typeof value === 'string' &&
            (isValidNextUrl(value) ||
              isAllowedReturnUrl(value, config.trustedOrigins))
          );
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + '$property must be an internal path or allowed URL',
          validationOptions
        ),
      },
    },
    validationOptions
  );
}
