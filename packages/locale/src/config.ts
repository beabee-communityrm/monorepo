import _config from "./config.json";
import type { LocaleConfig } from "./types/config.js";
import type { Locale } from "./types/locale.js";

export const config = _config as Record<Locale, LocaleConfig>;
