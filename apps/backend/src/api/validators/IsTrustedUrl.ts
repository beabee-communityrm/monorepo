import config from '@beabee/core/config';
import { optionsService } from '@beabee/core/services';
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
          if (typeof value !== 'string') return false;
          if (allowRelative && isValidNextUrl(value)) return true;

          const origins = [
            new URL(config.audience).origin,
            ...optionsService.getList('trusted-origins'),
          ];
          // Any localhost port in development
          const localhost =
            config.dev &&
            value.match(/^https?:\/\/localhost(:\d+)?(?=[/?#]|$)/);
          if (localhost) origins.push(localhost[0]);

          return isAllowedReturnUrl(value, origins);
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
