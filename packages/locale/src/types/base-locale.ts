import type { Locale } from './locale.ts';

export type BaseLocale = Exclude<Locale, `${string}@${string}`>;
