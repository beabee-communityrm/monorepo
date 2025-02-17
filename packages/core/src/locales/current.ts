import locales from "@beabee/locale/locales/index";
import OptionsService from "#services/OptionsService";

export default function currentLocale() {
  return locales[OptionsService.getText("locale")].default;
}
