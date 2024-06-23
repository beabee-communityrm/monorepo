import {
  config as i18nConfig,
  de,
  deEasy,
  deInformal,
  en,
  it,
  pt,
  ru,
} from "./locales/index.ts";

export { de, deEasy, deInformal, en, i18nConfig, it, pt, ru };

export const locales = {
  de,
  "de@informal": deInformal,
  "de@easy": deEasy,
  en,
  nl: en, // CNR only
  pt,
  ru,
  it,
} as const;

export type Locale = keyof typeof locales;

export function isLocale(s: string): s is Locale {
  return s in locales;
}

export type LocaleObject = (typeof locales)[Locale];

// export default function currentLocale() {
//   return locales[OptionsService.getText("locale") as Locale];
// }
