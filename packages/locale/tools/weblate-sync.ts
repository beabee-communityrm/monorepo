/**
 * Weblate Label Sync Script
 *
 * This script synchronizes labels from metadata-usage.ts to Weblate translation units.
 * It maps translation keys in the metadata to their English source strings in Weblate,
 * then applies the appropriate labels to those units.
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { metadataUsage } from "./metadata-usage.ts";
import { WeblateClient } from "@beabee/weblate-client";
import type { UnitResponseData } from "@beabee/weblate-client";

// Constants for Weblate labels and their IDs
const WEBLATE_LABELS: Record<string, number> = {
  User: 802,
  Admin: 803,
  CNR: 804,
  System: 805,
};

// Configuration interface
interface SyncConfig {
  baseUrl: string;
  token: string;
  project: string;
  component: string;
  dryRun: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({ path: join(__dirname, "../.env") });

/**
 * Main sync class to handle the synchronization process
 */
class WeblateSync {
  private client: WeblateClient;
  private metadata: Record<string, string>;
  private config: SyncConfig;

  constructor(config: SyncConfig, metadata: Record<string, string>) {
    this.config = config;
    this.metadata = metadata;
    this.client = new WeblateClient({
      baseUrl: config.baseUrl,
      token: config.token,
      project: config.project,
      component: config.component,
    });
  }

  /**
   * Main method to synchronize metadata labels with Weblate
   */
  public async sync(): Promise<void> {
    try {
      // Fetch only English units to process
      console.log("Processing translation keys from metadata...");

      let updatedCount = 0;
      let notFoundCount = 0;
      let errorsCount = 0;
      let multipleResultsCount = 0;

      // Iterate over metadata keys
      for (const translationKey in this.metadata) {
        if (
          Object.prototype.hasOwnProperty.call(this.metadata, translationKey)
        ) {
          const desiredMetadataLabelGroup = this.metadata[translationKey];

          try {
            // console.log(`Searching for unit with context: "${translationKey}" in Weblate...`);
            const searchData = await this.client.getTranslationUnits({
              component: this.config.component,
              project: this.config.project,
              language: "en", // Search within English units
              q: `context:"${translationKey}"`,
            });

            const unitsFound = searchData.results || [];

            if (!unitsFound.length) {
              if (notFoundCount < 10) {
                // Log first few misses
                console.log(
                  `No unit found in Weblate for context: "${translationKey}"`,
                );
              }
              notFoundCount++;
              continue;
            }

            if (unitsFound.length > 1) {
              console.warn(
                `Multiple units (${unitsFound.length}) found for context: "${translationKey}". Processing all.`,
              );
              multipleResultsCount++;
            }

            for (const unit of unitsFound) {
              // Double-check context as a safeguard, though search should be specific
              if (unit.context === translationKey) {
                await this.processUnitLabels(unit, desiredMetadataLabelGroup);
                updatedCount++;
              } else {
                console.warn(
                  `Found unit ${unit.id} with context "${unit.context}" but expected "${translationKey}" after searching. Skipping this specific unit.`,
                );
              }
            }
          } catch (error) {
            console.error(`Error processing key "${translationKey}":`, error);
            errorsCount++;
          }
        }
      }

      console.log(`
Sync summary:
- Successfully processed/updated units for matching keys: ${updatedCount}
- Keys from metadata not found in Weblate: ${notFoundCount}
- Keys resulting in multiple units (all processed): ${multipleResultsCount}
- Errors encountered during processing: ${errorsCount}
      `);
    } catch (error) {
      console.error("Error during synchronization:", error);
      throw error;
    }
  }

  /**
   * Process labels for a single unit
   */
  private async processUnitLabels(
    unit: UnitResponseData,
    metadata: string,
  ): Promise<void> {
    if (!unit.id) {
      console.log("No ID found for unit", unit);
      return;
    }

    // Get existing labels
    const existingLabels = this.parseExistingLabels(unit.labels);

    // Parse metadata to get desired labels
    const desiredLabels = this.parseDesiredLabels(metadata);

    // Check if we need to update labels
    const needsUpdate = this.labelsNeedUpdate(existingLabels, desiredLabels);

    if (!needsUpdate) {
      console.log(`Unit ${unit.id} (${unit.context}) does not need update`);
      return;
    }

    // Convert label names to IDs for the API
    const labelIdsToApply = desiredLabels
      .filter((label) => WEBLATE_LABELS[label] !== undefined)
      .map((label) => WEBLATE_LABELS[label]);

    if (this.config.dryRun) {
      console.log(`[DRY RUN] Would update unit ${unit.id} (${unit.context}):
  - Current labels: ${existingLabels.join(", ") || "none"}
  - New labels: ${desiredLabels.join(", ") || "none"}
  - Label IDs to apply: ${labelIdsToApply.join(", ") || "none"}`);
    } else {
      console.log(`Updating unit ${unit.id} (${unit.context}):
  - Current labels: ${existingLabels.join(", ") || "none"}
  - New labels: ${desiredLabels.join(", ") || "none"}
  - Label IDs to apply: ${labelIdsToApply.join(", ") || "none"}`);

      await this.client.updateUnitLabels(unit.id, labelIdsToApply);
    }
  }

  /**
   * Parse existing labels from a Weblate unit
   */
  private parseExistingLabels(labels: any[] = []): string[] {
    const result: string[] = [];

    for (const label of labels) {
      // Handle different possible formats for labels
      if (typeof label === "string" && WEBLATE_LABELS[label] !== undefined) {
        result.push(label);
      } else if (typeof label === "number") {
        // Convert ID back to name
        const name = Object.entries(WEBLATE_LABELS).find(
          ([_, id]) => id === label,
        )?.[0];
        if (name) {
          result.push(name);
        }
      } else if (typeof label === "object" && label !== null) {
        // Handle object format
        if (
          "name" in label &&
          typeof label.name === "string" &&
          WEBLATE_LABELS[label.name] !== undefined
        ) {
          result.push(label.name);
        } else if ("id" in label && typeof label.id === "number") {
          const name = Object.entries(WEBLATE_LABELS).find(
            ([_, id]) => id === label.id,
          )?.[0];
          if (name) {
            result.push(name);
          }
        }
      }
    }

    return result;
  }

  /**
   * Parse desired labels from metadata string
   */
  private parseDesiredLabels(metadata: string): string[] {
    return metadata
      .split(",")
      .map((label) => label.trim())
      .filter(
        (label) => label.length > 0 && WEBLATE_LABELS[label] !== undefined,
      );
  }

  /**
   * Check if labels need to be updated
   */
  private labelsNeedUpdate(
    existingLabels: string[],
    desiredLabels: string[],
  ): boolean {
    if (existingLabels.length !== desiredLabels.length) {
      return true;
    }

    const sortedExisting = [...existingLabels].sort();
    const sortedDesired = [...desiredLabels].sort();

    return JSON.stringify(sortedExisting) !== JSON.stringify(sortedDesired);
  }
}

/**
 * Main function to run the script
 */
async function main(): Promise<void> {
  try {
    const {
      WEBLATE_API_URL,
      WEBLATE_API_TOKEN,
      WEBLATE_PROJECT,
      WEBLATE_COMPONENT,
      DRY_RUN,
    } = process.env;

    // Check required environment variables
    if (
      !WEBLATE_API_URL ||
      !WEBLATE_API_TOKEN ||
      !WEBLATE_PROJECT ||
      !WEBLATE_COMPONENT
    ) {
      console.error(`
Missing required environment variables. Please ensure you have the following set:
- WEBLATE_API_URL
- WEBLATE_API_TOKEN
- WEBLATE_PROJECT
- WEBLATE_COMPONENT
      `);
      process.exit(1);
    }

    const config: SyncConfig = {
      baseUrl: WEBLATE_API_URL,
      token: WEBLATE_API_TOKEN,
      project: WEBLATE_PROJECT,
      component: WEBLATE_COMPONENT,
      dryRun: DRY_RUN === "true" || DRY_RUN === "1",
    };

    if (config.dryRun) {
      console.log("Running in DRY RUN mode - no changes will be made");
    }

    const sync = new WeblateSync(config, metadataUsage);
    await sync.sync();
    console.log("Sync completed successfully");
  } catch (error) {
    console.error("Error running sync:", error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("Critical error:", error);
  process.exit(1);
});
