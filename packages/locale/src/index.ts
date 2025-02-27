import _config from "./config.json";

export type Locale = keyof typeof _config;
export type BaseLocale = Exclude<Locale, `${string}@${string}`>;

export interface LocaleConfig {
  baseLocale: BaseLocale;
  name: string;
  displayName: string;
  adminLocale: Locale;
}

const config = _config as Record<Locale, LocaleConfig>;
export { config };

export function isLocale(s: string): s is Locale {
  return s in config;
}
