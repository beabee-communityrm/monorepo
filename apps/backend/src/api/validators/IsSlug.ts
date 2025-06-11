import { ValidateBy, ValidationOptions, buildMessage } from 'class-validator';
import slugify from 'slugify';

export default function IsSlug(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isSlug',
      validator: {
        validate(value) {
          return typeof value === 'string' && value === slugify(value);
        },
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must be a slug',
          validationOptions
        ),
      },
    },
    validationOptions
  );
}
