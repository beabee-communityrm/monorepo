/**
 * Script to generate a template file from the English locale file
 *
 * This script loads the English locale file, removes all string values
 * and saves it as a template file that can be used as a starting point
 * for new translations.
 */

import { join } from "node:path";
import {
  readJsonFile,
  writeJsonFile,
  processObjectStrings,
  handleError
} from "./utils.ts";

/**
 * Generates a template file from the English locale file
 * @param localesDir Directory containing the locale files
 * @param templatePath Path where to save the template file
 */
export async function generateTemplate(
  localesDir: string,
  templatePath: string
): Promise<void> {
  try {
    const englishFilePath = join(localesDir, "en.json");

    console.log(`Reading English locale file from ${englishFilePath}`);

    // Read the English locale file and process it
    const englishData =
      await readJsonFile<Record<string, any>>(englishFilePath);
    const templateData = processObjectStrings(englishData, () => "");

    // Save the template file
    await writeJsonFile(templatePath, templateData);

    console.log(`Template file successfully created at ${templatePath}`);
  } catch (error) {
    handleError(error, "generating template file");
  }
}
