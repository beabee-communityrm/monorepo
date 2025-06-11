/**
 * Script to normalize all translation files
 *
 * This script ensures all translation files have the same structure as the English one.
 * It adds missing keys with empty strings to all locale files.
 */

import { readdir } from "node:fs/promises";
import { join } from "node:path";
import {
  readJsonFile,
  writeJsonFile,
  mergeObjects,
  handleError
} from "./utils.ts";

/**
 * Normalizes all translation files to ensure they have the same structure
 * @param localesDir Directory containing the locale files
 */
export async function normalizeTranslations(localesDir: string): Promise<void> {
  try {
    const englishFilePath = join(localesDir, "en.json");

    console.log(`Reading English locale file from ${englishFilePath}`);

    // Read the English locale file
    const englishData =
      await readJsonFile<Record<string, any>>(englishFilePath);

    // Get all JSON files in the locales directory
    const files = await readdir(localesDir);
    const jsonFiles = files.filter(
      (file) => file.endsWith(".json") && file !== "en.json"
    );

    console.log(`Found ${jsonFiles.length} translation files to normalize`);

    // Process each file
    for (const file of jsonFiles) {
      const filePath = join(localesDir, file);
      console.log(`Normalizing ${file}...`);

      // Read the translation file
      const fileData = await readJsonFile<Record<string, any>>(filePath);

      // Merge with English data, adding missing keys with empty strings
      const normalizedData = mergeObjects(
        fileData,
        englishData,
        (targetValue, sourceValue) => targetValue || ""
      );

      // Write the normalized file
      await writeJsonFile(filePath, normalizedData);

      console.log(`${file} normalized successfully`);
    }

    console.log("All translation files have been normalized");
  } catch (error) {
    handleError(error, "normalizing translation files");
  }
}
