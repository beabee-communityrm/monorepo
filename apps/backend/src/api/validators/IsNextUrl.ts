import { isValidNextUrl } from '@beabee/core/utils/url';

import { ValidateBy, ValidationOptions, buildMessage } from 'class-validator';

/** An internal path to continue to after login */
export default function IsNextUrl(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isNextUrl',
      validator: {
        validate(value) {
          return typeof value === 'string' && isValidNextUrl(value);
        },
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must be an internal path',
          validationOptions
        ),
      },
    },
    validationOptions
  );
}
