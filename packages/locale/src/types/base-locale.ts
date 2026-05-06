import type { Locale } from './locale.js';

export type BaseLocale = Exclude<Locale, `${string}@${string}`>;
