/**
 * Script to normalize all translation files
 *
 * This script ensures all translation files have the same structure as the English one.
 * It adds missing keys with empty strings to all locale files.
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recursively merges the target object with the source object
 * If a key exists in the source but not in the target, it will be added to the target with an empty string
 *
 * @param target The target object to be updated
 * @param source The source object containing the complete structure
 * @returns The merged object
 */
function mergeWithEmptyStrings(
  target: Record<string, any>,
  source: Record<string, any>,
): Record<string, any> {
  const result = { ...target };

  // Iterate through all keys in the source
  for (const [key, sourceValue] of Object.entries(source)) {
    // If the key doesn't exist in the target, add it
    if (!(key in result)) {
      // If it's an object in source, create an empty object
      if (sourceValue !== null && typeof sourceValue === "object") {
        result[key] = {};
      }
      // If it's a string in source, create an empty string
      else if (typeof sourceValue === "string") {
        result[key] = "";
      }
      // Otherwise, copy the value
      else {
        result[key] = sourceValue;
      }
    }

    // If both values are objects, merge them recursively
    if (
      sourceValue !== null &&
      typeof sourceValue === "object" &&
      result[key] !== null &&
      typeof result[key] === "object"
    ) {
      result[key] = mergeWithEmptyStrings(result[key], sourceValue);
    }
  }

  return result;
}

/**
 * Normalizes all translation files to ensure they have the same structure
 */
export async function normalizeTranslations(): Promise<void> {
  try {
    const srcDir = path.join(__dirname, "..", "src", "locales");
    const englishFilePath = path.join(srcDir, "en.json");

    console.log(`Reading English locale file from ${englishFilePath}`);

    // Read the English locale file
    const englishFileContent = await readFile(englishFilePath, "utf-8");
    const englishData = JSON.parse(englishFileContent);

    // Get all JSON files in the locales directory
    const files = await readdir(srcDir);
    const jsonFiles = files.filter(
      (file) => file.endsWith(".json") && file !== "en.json",
    );

    console.log(`Found ${jsonFiles.length} translation files to normalize`);

    // Process each file
    for (const file of jsonFiles) {
      const filePath = path.join(srcDir, file);
      console.log(`Normalizing ${file}...`);

      // Read the translation file
      const fileContent = await readFile(filePath, "utf-8");
      const fileData = JSON.parse(fileContent);

      // Merge with English data, adding missing keys with empty strings
      const normalizedData = mergeWithEmptyStrings(fileData, englishData);

      // Write the normalized file
      await writeFile(
        filePath,
        JSON.stringify(normalizedData, null, 2),
        "utf-8",
      );

      console.log(`${file} normalized successfully`);
    }

    console.log("All translation files have been normalized");
  } catch (error) {
    console.error("Error normalizing translation files:", error);
    throw error;
  }
}
