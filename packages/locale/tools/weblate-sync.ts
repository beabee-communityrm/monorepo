/**
 * TEMPORARY MIGRATION SCRIPT
 *
 * This script is only needed temporarily for the migration from Google Sheets to Weblate.
 * It transfers the labels from the Google Sheets metadata to Weblate labels.
 * Once the migration to Weblate is complete and verified, this script can be safely deleted.
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { metadataUsage } from "./metadata-usage.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in the packages/locale directory
config({ path: join(__dirname, "../.env") });

/**
 * Defines a mapping of known Weblate label names to their corresponding Weblate label IDs.
 * The keys (e.g., "User", "Admin") are used to validate label strings sourced from the metadata.
 * The IDs are for reference or potential future use with other Weblate API endpoints if needed.
 * When updating labels on a unit via PATCH /api/units/(int:id)/, Weblate expects an array of label *names* (strings).
 */
const WeblateLabels = {
  User: 802,
  Admin: 803,
  CNR: 804,
  System: 805,
};

interface WeblateConfig {
  apiUrl: string;
  token: string;
  project: string;
  component: string;
  dryRun?: boolean;
}

interface UsageMetadata {
  [key: string]: string;
}

// Define a basic interface for WeblateUnit
interface WeblateUnit {
  id: number;
  source: string[];
  target: string[];
  context: string;
  note: string;
  labels?: any[];
  language_code: string;
  url: string;
  source_unit: string | null;
  [key: string]: any;
}

/**
 * Syncs translation metadata with Weblate using their REST API
 */
class WeblateSync {
  private config: WeblateConfig;
  private usageData: UsageMetadata; // Store the imported metadata

  constructor(config: WeblateConfig, usageData: UsageMetadata) {
    let apiUrl = config.apiUrl;
    if (!apiUrl.endsWith("/api/")) {
      if (apiUrl.endsWith("/")) {
        apiUrl = `${apiUrl}api/`;
      } else {
        apiUrl = `${apiUrl}/api/`;
      }
    }
    this.config = { ...config, apiUrl };
    this.usageData = usageData; // Assign imported metadata

    if (this.config.dryRun) {
      console.log(
        "[DRY RUN] WeblateSync initialized with config:",
        this.config,
      );
      console.log("[DRY RUN] Using metadata:", this.usageData);
    }
  }

  /**
   * Makes an authenticated request to the Weblate API
   */
  private async makeRequest(path: string, method: string, body?: any) {
    const url = new URL(path, this.config.apiUrl).toString();
    if (this.config.dryRun && method !== "GET") {
      console.log(`[DRY RUN] Would ${method} to ${url} with body:`, body);
      return Promise.resolve({}); // Simulate a successful response for non-GET dry runs
    }
    if (this.config.dryRun && method === "GET") {
      console.log(`[DRY RUN] Would ${method} from ${url}`);
      if (path.startsWith("units/?q=")) {
        return Promise.resolve({ results: [] });
      }
      return Promise.resolve({});
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Token ${this.config.token}`,
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `Weblate API error: ${response.status} ${response.statusText} for URL: ${url}`,
        );
        console.error("Error details:", errorBody);
        throw new Error(
          `Request failed with status code ${response.status} - ${response.statusText}`,
        );
      }
      if (response.status === 204) {
        return {};
      }
      return await response.json();
    } catch (error) {
      console.error(`Error making request to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Fetches all translation units for the configured project and component
   */
  private async getUnits(): Promise<WeblateUnit[]> {
    if (this.config.dryRun) {
      console.log(
        `[DRY RUN] Would fetch units for project ${this.config.project}, component ${this.config.component}`,
      );
    }
    const path = `units/?q=project:${encodeURIComponent(this.config.project)} AND component:${encodeURIComponent(this.config.component)}`;
    try {
      const response = (await this.makeRequest(path, "GET")) as {
        results: WeblateUnit[];
        next?: string | null;
        previous?: string | null;
        count?: number;
      };

      return response.results;
    } catch (error) {
      return [];
    }
  }

  /**
   * Updates the labels/tags for a specific translation unit
   */
  private async updateUnitLabels(unitId: number, labelIds: number[]) {
    if (this.config.dryRun) {
      console.log(
        `[DRY RUN] Would update unit ${unitId} with label IDs:`,
        labelIds,
      );
      return;
    }
    return this.makeRequest(`units/${unitId}/`, "PATCH", {
      labels: labelIds,
    });
  }

  /**
   * Syncs the metadata from the imported object to Weblate labels
   */
  public async syncMetadata() {
    if (this.config.dryRun) {
      console.log("[DRY RUN] Starting metadata sync (no changes will be made)");
    } else {
      console.log("Starting metadata sync");
    }

    const units = await this.getUnits();

    if (!units || units.length === 0) {
      console.log(
        "No translation units found in Weblate or error fetching them. Ensure project/component are correct and accessible.",
      );
      return;
    }

    console.log(
      `Found ${units.length} translation units in Weblate for project '${this.config.project}', component '${this.config.component}'.`,
    );

    let updatedCount = 0;
    let notFoundCount = 0;
    let nonSourceSkippedCount = 0;
    let sourceTextMismatchSkippedCount = 0;

    for (const unit of units) {
      const key = unit.context;
      const unitSourceText =
        unit.source && unit.source.length > 0 ? unit.source[0] : "";

      const isPotentialSourceUnit =
        unit.url === unit.source_unit || unit.source_unit === null;

      if (!(isPotentialSourceUnit && unit.language_code === "en")) {
        nonSourceSkippedCount++;
        if (this.config.dryRun && nonSourceSkippedCount < 10) {
          console.log(
            `[DRY RUN] Unit ${unit.id} (context: ${key}, lang: ${unit.language_code}): Skipping as it's not an English source unit (url: ${unit.url}, source_unit: ${unit.source_unit}).`,
          );
        }
        continue;
      }

      if (this.usageData[key]) {
        const rawExistingLabels = unit.labels || [];
        const existingLabels: string[] = rawExistingLabels
          .map((label: unknown) => {
            if (typeof label === "string") {
              return label;
            }
            if (
              typeof label === "object" &&
              label !== null &&
              "name" in label &&
              typeof (label as { name: unknown }).name === "string"
            ) {
              return (label as { name: string }).name;
            }
            const message = `Unit ${unit.id} (context: ${key}): Encountered an unexpected structure in existing labels from Weblate: ${JSON.stringify(label)}. This label will be ignored.`;
            if (this.config.dryRun) {
              console.log(`[DRY RUN] ${message}`);
            } else {
              console.warn(`[Sync Metadata] ${message}`);
            }
            return null;
          })
          .filter((labelName): labelName is string => labelName !== null);

        const labelStringsFromMetadata = this.usageData[key]
          .split(",")
          .map((label) => label.trim())
          .filter((label) => label.length > 0);

        const knownLabelNames = Object.keys(WeblateLabels);
        const newLabelsToApply = labelStringsFromMetadata.filter(
          (labelName) => {
            if (knownLabelNames.includes(labelName)) {
              return true;
            } else {
              const message = `Label "${labelName}" from metadata for context "${key}" is not a known Weblate label name (from WeblateLabels constant). It will be ignored.`;
              if (this.config.dryRun) {
                console.log(`[DRY RUN] [Sync Metadata] ${message}`);
              } else {
                console.warn(`[Sync Metadata] ${message}`);
              }
              return false;
            }
          },
        );

        if (
          newLabelsToApply.length === 0 &&
          labelStringsFromMetadata.length > 0
        ) {
          const message = `Context "${key}": All labels from metadata (${labelStringsFromMetadata.join(", ")}) were unknown or filtered out. No new labels will be added based on metadata for this unit.`;
          if (this.config.dryRun) {
            console.log(`[DRY RUN] [Sync Metadata] ${message}`);
          } else {
            console.log(`[Sync Metadata] ${message}`);
          }
        }

        const labelsToSet = Array.from(
          new Set([...existingLabels, ...newLabelsToApply]),
        );

        if (
          JSON.stringify(labelsToSet.sort()) !==
          JSON.stringify(existingLabels.sort())
        ) {
          const labelIdsToSend: number[] = [];
          for (const name of labelsToSet) {
            const id = WeblateLabels[name as keyof typeof WeblateLabels];
            if (id !== undefined) {
              labelIdsToSend.push(id);
            } else {
              const message = `Cannot map label name "${name}" to an ID for unit ${unit.id} (context: ${key}). It will be omitted from the update. Please ensure all desired labels are defined in WeblateLabels.`;
              if (this.config.dryRun) {
                console.log(`[DRY RUN] [Sync Metadata] ${message}`);
              } else {
                console.warn(`[Sync Metadata] ${message}`);
              }
            }
          }

          if (this.config.dryRun) {
            console.log(
              `[DRY RUN] Unit ${unit.id} (context: ${key}): Current names: ${existingLabels.join(", ") || "[]"}. Desired names: ${labelsToSet.join(", ")}. Would update with Label IDs: ${labelIdsToSend.join(", ")}`,
            );
          } else {
            console.log(
              `Unit ${unit.id} (context: ${key}): Current names: ${existingLabels.join(", ") || "[]"}. Desired names: ${labelsToSet.join(", ")}. Updating with Label IDs: ${labelIdsToSend.join(", ")}`,
            );
            if (labelIdsToSend.length > 0 || labelsToSet.length === 0) {
              await this.updateUnitLabels(unit.id, labelIdsToSend);
            } else if (labelsToSet.length > 0 && labelIdsToSend.length === 0) {
              console.warn(
                `[Sync Metadata] Unit ${unit.id} (context: ${key}): All desired label names (${labelsToSet.join(", ")}) could not be mapped to IDs. No update sent.`,
              );
            }
          }
          updatedCount++;
        } else {
          if (this.config.dryRun) {
            console.log(
              `[DRY RUN] Unit ${unit.id} (context: ${key}): Labels are already up-to-date (${existingLabels.join(", ")}).`,
            );
          } else {
            console.log(
              `Unit ${unit.id} (context: ${key}): Labels already up-to-date.`,
            );
          }
        }
      } else {
        notFoundCount++;
      }
    }
    if (nonSourceSkippedCount > 0) {
      console.log(
        `${nonSourceSkippedCount} units were skipped because they were not identified as English source string units.`,
      );
    }
    if (notFoundCount > 0) {
      console.log(
        `${notFoundCount} units from Weblate did not have matching entries in the imported metadata.`,
      );
    }
    console.log(
      `Metadata sync ${this.config.dryRun ? "simulation" : ""} completed. ${updatedCount} units processed for label updates.`,
    );
  }
}

async function main() {
  const {
    WEBLATE_API_URL,
    WEBLATE_API_TOKEN,
    WEBLATE_PROJECT,
    WEBLATE_COMPONENT,
    DRY_RUN,
  } = process.env;

  if (
    !WEBLATE_API_URL ||
    !WEBLATE_API_TOKEN ||
    !WEBLATE_PROJECT ||
    !WEBLATE_COMPONENT
  ) {
    console.error(
      "Missing Weblate environment variables. Ensure WEBLATE_API_URL, WEBLATE_API_TOKEN, WEBLATE_PROJECT, and WEBLATE_COMPONENT are set.",
    );
    process.exit(1);
  }

  const cfg: WeblateConfig = {
    apiUrl: WEBLATE_API_URL,
    token: WEBLATE_API_TOKEN,
    project: WEBLATE_PROJECT,
    component: WEBLATE_COMPONENT,
    dryRun: DRY_RUN === "true" || DRY_RUN === "1",
  };

  // Pass the imported metadataUsage to the constructor
  const sync = new WeblateSync(cfg, metadataUsage);
  try {
    await sync.syncMetadata();
  } catch (error) {
    console.error("Unhandled error during sync process:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Critical error in main execution:", error);
  process.exit(1);
});
