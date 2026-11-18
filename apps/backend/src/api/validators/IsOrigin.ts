import { ValidateBy, ValidationOptions, buildMessage } from 'class-validator';

/** An http(s) origin with nothing else: no path, query, hash or credentials */
export default function IsOrigin(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isOrigin',
      validator: {
        validate(value) {
          if (typeof value !== 'string' || !/^https?:\/\//.test(value)) {
            return false;
          }
          try {
            return new URL(value).origin === value;
          } catch {
            return false;
          }
        },
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must be an origin',
          validationOptions
        ),
      },
    },
    validationOptions
  );
}
