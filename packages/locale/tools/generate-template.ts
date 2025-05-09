/**
 * Script to generate a template file from the English locale file
 *
 * This script loads the English locale file, removes all string values
 * and saves it as a template file that can be used as a starting point
 * for new translations.
 *
 * Usage: node --experimental-specifier-resolution=node --experimental-strip-types ./tools/generate-template.ts
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recursively processes an object, emptying all string values
 * @param obj The object to process
 * @returns A new object with the same structure but empty string values
 */
function emptyStringValues(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    // If the value is an object, process it recursively
    if (value !== null && typeof value === "object") {
      result[key] = emptyStringValues(value);
    }
    // If the value is a string, replace it with an empty string
    else if (typeof value === "string") {
      result[key] = "";
    }
    // Otherwise, keep the value as is (for non-string primitives)
    else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Generates a template file from the English locale file
 */
export async function generateTemplate(): Promise<void> {
  try {
    const srcDir = path.join(__dirname, "..", "src", "locales");
    const englishFilePath = path.join(srcDir, "en.json");
    const templateFilePath = path.join(srcDir, "template.json");

    console.log(`Reading English locale file from ${englishFilePath}`);

    // Read the English locale file
    const englishFileContent = await readFile(englishFilePath, "utf-8");
    const englishData = JSON.parse(englishFileContent);

    // Process the data to create a template
    const templateData = emptyStringValues(englishData);

    // Save the template file
    await writeFile(templateFilePath, JSON.stringify(templateData, null, 2));

    console.log(`Template file successfully created at ${templateFilePath}`);
  } catch (error) {
    console.error("Error generating template file:", error);
    throw error;
  }
}

// Execute the function if this file is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateTemplate().catch((error) => {
    console.error("Failed to generate template:", error);
    process.exit(1);
  });
}
