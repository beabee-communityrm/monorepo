import config from '@beabee/core/config';
import { getTrustedOrigins } from '@beabee/core/utils/trusted-origins';
import { isAllowedReturnUrl, isValidNextUrl } from '@beabee/core/utils/url';

import { ValidateBy, ValidationOptions, buildMessage } from 'class-validator';

import { IsTrustedUrlOptions } from '#type/index';

/**
 * An absolute URL on this instance or a trusted origin, or optionally an
 * internal path
 */
export default function IsTrustedUrl(
  { allowRelative = false }: IsTrustedUrlOptions = {},
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isTrustedUrl',
      validator: {
        validate(value) {
          return (
            typeof value === 'string' &&
            ((allowRelative && isValidNextUrl(value)) ||
              isAllowedReturnUrl(value, [
                new URL(config.audience).origin,
                ...getTrustedOrigins(),
              ]))
          );
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix +
            (allowRelative
              ? '$property must be an internal path or allowed URL'
              : '$property must be an allowed URL'),
          validationOptions
        ),
      },
    },
    validationOptions
  );
}
