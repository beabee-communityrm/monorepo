import { isMapBounds } from '@beabee/beabee-common';

import type { ValidationOptions } from 'class-validator';
import { ValidateBy, buildMessage } from 'class-validator';

export default function IsMapBounds(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isMapBounds',
      validator: {
        validate: isMapBounds,
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + '$property must be a [[lng, lat], [lng, lat]]',
          validationOptions
        ),
      },
    },
    validationOptions
  );
}
