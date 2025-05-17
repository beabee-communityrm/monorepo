import { config } from "./config.js";
import { Context } from "./context.js";
import { Locale } from "./types/locale";

export function isLocale(s: string): s is Locale {
  return s in config;
}

export function isAvailableInContext(s: Locale, context: Context): boolean {
  return config[s].availableIn.includes(context);
}
