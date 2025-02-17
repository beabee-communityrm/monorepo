import _config from './config.js';

export type Locale = keyof typeof config;

export const config = _config;

export function isLocale(s: string): s is Locale {
  return s in config;
}
