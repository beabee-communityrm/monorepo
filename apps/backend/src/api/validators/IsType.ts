import { isType } from '@beabee/beabee-common';

import type { ValidationOptions } from 'class-validator';
import { ValidateBy } from 'class-validator';
import type { ValidationArguments } from 'class-validator';

export function IsType(
  types: Array<
    | 'string'
    | 'number'
    | 'bigint'
    | 'boolean'
    | 'symbol'
    | 'undefined'
    | 'object'
    | 'function'
  >,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isType',
      validator: {
        validate: (value: unknown) => isType(types, value),
        defaultMessage: ({ value }: ValidationArguments) =>
          `Current type ${typeof value} is not in [${types.join(', ')}]`,
      },
    },
    validationOptions
  );
}
