import { calloutComponentAddressTypes } from "./callout-component-address-types.ts";
import { calloutComponentCheckboxTypes } from "./callout-component-checkbox-types.ts";
import { calloutComponentContentTypes } from "./callout-component-content-types.ts";
import { calloutComponentCurrencyTypes } from "./callout-component-currency-types.ts";
import { calloutComponentDateTimeTypes } from "./callout-component-date-time-types.ts";
import { calloutComponentEmailTypes } from "./callout-component-email-types.ts";
import { calloutComponentFileTypes } from "./callout-component-file-types.ts";
import { calloutComponentNestableTypes } from "./callout-component-nestable-types.ts";
import { calloutComponentNumberTypes } from "./callout-component-number-types.ts";
import { calloutComponentPhoneNumberTypes } from "./callout-component-phone-number-types.ts";
import { calloutComponentRadioTypes } from "./callout-component-radio-types.ts";
import { calloutComponentSelectTypes } from "./callout-component-select-types.ts";
import { calloutComponentSignatureTypes } from "./callout-component-signature-types.ts";
import { calloutComponentTextTypes } from "./callout-component-text-types.ts";
import { calloutComponentTimeTypes } from "./callout-component-time-types.ts";
import { calloutComponentUrlTypes } from "./callout-component-url-types.ts";

import type { CalloutComponentType } from "../types/index.ts";

/** Array of all possible callout component types */
export const calloutComponentTypes: CalloutComponentType[] = [
  ...calloutComponentContentTypes,
  ...calloutComponentFileTypes,
  ...calloutComponentNestableTypes,
  ...calloutComponentRadioTypes,
  ...calloutComponentSelectTypes,
  ...calloutComponentTextTypes,
  ...calloutComponentAddressTypes,
  ...calloutComponentCheckboxTypes,
  ...calloutComponentCurrencyTypes,
  ...calloutComponentDateTimeTypes,
  ...calloutComponentEmailTypes,
  ...calloutComponentNumberTypes,
  ...calloutComponentPhoneNumberTypes,
  ...calloutComponentSignatureTypes,
  ...calloutComponentTimeTypes,
  ...calloutComponentUrlTypes,
];
