import { en, de, deInformal, deEasy, pt, ru, it, config as i18nConfig } from './locales/index.ts';

export { en, de, deInformal, deEasy, pt, ru, it, i18nConfig }

export const locales = {
  de,
  "de@informal": deInformal,
  "de@easy": deEasy,
  en,
  nl: en, // CNR only
  pt,
  ru,
  it
} as const;

export type Locale = keyof typeof locales;

export function isLocale(s: string): s is Locale {
  return s in locales;
}

export type LocaleObject = (typeof locales)[Locale];

// export default function currentLocale() {
//   return locales[OptionsService.getText("locale") as Locale];
// }
