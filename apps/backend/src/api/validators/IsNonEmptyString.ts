import {
  ValidateBy,
  ValidationOptions,
  buildMessage,
  isString,
} from 'class-validator';

export default function IsNonEmptyString(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isNonEmptyString',
      validator: {
        validate: (value) => isString(value) && value.trim() !== '',
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must be a non-empty string',
          validationOptions
        ),
      },
    },
    validationOptions
  );
}
