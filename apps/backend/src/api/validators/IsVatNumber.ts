import { ValidationOptions, ValidateBy, buildMessage } from "class-validator";
import { checkVAT, countries } from "jsvat-next";

export default function IsVatNumber(
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: "isVatNumber",
      validator: {
        validate(value) {
          return (
            typeof value === "string" &&
            checkVAT(value, countries).isValidFormat
          );
        },
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + "$property must be a valid VAT number",
          validationOptions
        )
      }
    },
    validationOptions
  );
}
