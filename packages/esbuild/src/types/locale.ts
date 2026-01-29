/** Locale JSON: nested objects and string values only. */
export interface LocaleObject {
  [key: string]: string | LocaleObject;
}
