import _config from "./config.json";
import { LocaleConfig, Locale, BaseLocale } from "./types/index.js";

const config = _config as Record<Locale, LocaleConfig>;
export { config };

export function isLocale(s: string): s is Locale {
  return s in config;
}

export type { LocaleConfig, Locale, BaseLocale };
