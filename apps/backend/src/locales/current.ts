import { optionsService } from "@beabee/core";
import { locales, Locale, LocaleObject } from "@beabee/locales";

// TODO: Move to `@beabee/locales`?
export default function currentLocale(): LocaleObject {
  return locales[optionsService.getText("locale") as Locale];
}
