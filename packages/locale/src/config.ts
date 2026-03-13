import { LocaleContext } from './locale-context.ts';
import type { LocaleOptions } from './types/locale-option.ts';

export const config: LocaleOptions = {
  en: {
    baseLocale: 'en',
    name: 'English',
    displayName: 'English',
    adminLocale: 'en',
    availableIn: [LocaleContext.Callout, LocaleContext.System],
  },
  de: {
    baseLocale: 'de',
    name: 'Deutsch (formal)',
    displayName: 'Deutsch',
    adminLocale: 'de',
    availableIn: [LocaleContext.Callout, LocaleContext.System],
  },
  'de@informal': {
    baseLocale: 'de',
    name: 'Deutsch (informal)',
    displayName: 'Deutsch',
    adminLocale: 'de@informal',
    fallbackLocale: 'de',
    availableIn: [LocaleContext.Callout, LocaleContext.System],
  },
  'de@easy': {
    baseLocale: 'de',
    name: 'Deutsch (einfach)',
    displayName: 'Leichte Sprache',
    adminLocale: 'de',
    fallbackLocale: 'de@informal',
    availableIn: [LocaleContext.Callout],
  },
  nl: {
    baseLocale: 'nl',
    name: 'Nederlands',
    displayName: 'Nederlands',
    adminLocale: 'en',
    availableIn: [LocaleContext.Callout, LocaleContext.System],
  },
  pt: {
    baseLocale: 'pt',
    name: 'Português',
    displayName: 'Português',
    adminLocale: 'en',
    availableIn: [LocaleContext.Callout, LocaleContext.System],
  },
  it: {
    baseLocale: 'it',
    name: 'Italiano',
    displayName: 'Italiano',
    adminLocale: 'en',
    availableIn: [LocaleContext.Callout, LocaleContext.System],
  },
  ru: {
    baseLocale: 'ru',
    name: 'Русский',
    displayName: 'Русский',
    adminLocale: 'en',
    availableIn: [LocaleContext.Callout, LocaleContext.System],
  },
  uk: {
    baseLocale: 'uk',
    name: 'Українська',
    displayName: 'Українська',
    adminLocale: 'uk',
    availableIn: [LocaleContext.Callout, LocaleContext.System],
  },
  fr: {
    baseLocale: 'fr',
    name: 'Français',
    displayName: 'Français',
    adminLocale: 'fr',
    availableIn: [LocaleContext.Callout, LocaleContext.System],
  },
  el: {
    baseLocale: 'el',
    name: 'Ελληνικά',
    displayName: 'Ελληνικά',
    adminLocale: 'en',
    availableIn: [LocaleContext.Callout],
  },
};
