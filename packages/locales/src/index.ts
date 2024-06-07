import { de } from "./locales/de.ts";
import { deInformal } from "./locales/de@informal.ts";
import { deEasy } from "./locales/de@easy.ts";
import { en } from "./locales/en.ts";
import { pt } from "./locales/pt.ts";
import { ru } from "./locales/ru.ts";
import { it } from "./locales/it.ts";

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
