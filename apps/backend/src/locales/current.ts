import OptionsService from "@core/services/OptionsService";
import { locales, Locale } from "@beabee/locales";

// TODO: Move to `@beabee/locales`?
export default function currentLocale() {
  return locales[OptionsService.getText("locale") as Locale];
}
