/**
 * Script to generate a template file from the English locale file
 *
 * This script loads the English locale file, removes all string values
 * and saves it as a template file that can be used as a starting point
 * for new translations.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getLocalesDir,
  readJsonFile,
  writeJsonFile,
  processObjectStrings,
  handleError,
} from "./utils.ts";

/**
 * Generates a template file from the English locale file
 */
export async function generateTemplate(): Promise<void> {
  try {
    const localesDir = getLocalesDir();
    const englishFilePath = path.join(localesDir, "en.json");
    const templateFilePath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "..",
      "src",
      "template.json",
    );

    console.log(`Reading English locale file from ${englishFilePath}`);

    // Read the English locale file and process it
    const englishData =
      await readJsonFile<Record<string, any>>(englishFilePath);
    const templateData = processObjectStrings(englishData, () => "");

    // Save the template file
    await writeJsonFile(templateFilePath, templateData);

    console.log(`Template file successfully created at ${templateFilePath}`);
  } catch (error) {
    handleError(error, "generating template file");
  }
}

// Execute the function if this file is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateTemplate().catch((error) => {
    console.error("Failed to generate template:", error);
    process.exit(1);
  });
}
