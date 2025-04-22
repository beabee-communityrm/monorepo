/**
 * Represents a localized text property that supports multiple languages.
 *
 * This interface is used throughout the application to handle multilingual content.
 * The `default` property contains the text in the system's default language (set in general settings),
 * while additional language translations are stored as key-value pairs where the key is the locale code.
 *
 * @example
 * // A title with English as default and German translation
 * const title: LocaleProp = {
 *   default: "Hello World",
 *   de: "Hallo Welt"
 * };
 *
 * @example
 * // Accessing translations
 * const defaultText = title.default; // "Hello World"
 * const germanText = title.de || title.default; // "Hallo Welt" (falls back to default if not available)
 */
export interface LocaleProp {
  /** The text in the system's default language */
  default: string;
  /** Additional translations keyed by locale code */
  [key: string]: string | undefined;
}
