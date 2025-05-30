import type { Plugin } from "esbuild";
import path from "node:path";
import { applyFallbackTranslations } from "./fallback-translations.ts";
import type { LocalePluginOptions } from "../types/index.ts";

/**
 * Creates an esbuild plugin that processes locale files by applying fallback translations
 * @param options Plugin options
 * @returns An esbuild plugin
 */
export function localePlugin({
  configPath,
  sourceLocalesDir,
}: LocalePluginOptions): Plugin {
  let processedTranslations: Record<string, Record<string, any>> | null = null;

  return {
    name: "locale-plugin",
    setup(build) {
      // Configure the plugin to handle JSON files
      build.onLoad(
        { filter: /[/\\]locales[/\\][^/\\]+\.json$/ },
        async (args) => {
          // Initialize processed translations if not done yet
          if (!processedTranslations) {
            processedTranslations = await applyFallbackTranslations(
              configPath,
              sourceLocalesDir,
            );
          }

          // Get the locale ID from the file name
          const fileName = path.basename(args.path);
          const localeId = fileName.replace(".json", "");

          // For English locale or if no processed translations exist, just return the file as is
          if (localeId === "en" || !processedTranslations[localeId]) {
            return null; // Let esbuild handle it with the default json loader
          }

          // Return the processed translations as a JSON file
          return {
            contents: JSON.stringify(processedTranslations[localeId], null, 2),
            loader: "copy", // Use copy loader to keep it as JSON
          };
        },
      );
    },
  };
}
