import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";

import {
  MigrateImagesOptions,
  MigrationStats
} from "../../types/migrate-images.js";
import { findMainImage } from "../../utils/files.js";
import {
  formatFileSize,
  formatSuccessMessage,
  formatDryRunMessage
} from "../../utils/format.js";

// Import the required services and utilities from core
import { imageService } from "@beabee/core/services/ImageService";
import { calloutsService } from "@beabee/core/services/CalloutsService";
import { config } from "@beabee/core/config";
import { connect as connectToDatabase } from "@beabee/core/database";
import { optionsService } from "@beabee/core/services/OptionsService";

/**
 * Migrates images from local storage to MinIO using ImageService
 * @param options Migration options
 */
export async function migrateImages(
  options: MigrateImagesOptions
): Promise<void> {
  try {
    const isDryRun = options.dryRun === true;
    if (isDryRun) {
      console.log(chalk.yellow("DRY RUN MODE: No files will be uploaded"));
    }

    // Initialize database connection
    console.log("Initializing database connection...");
    try {
      await connectToDatabase();
      console.log(chalk.green("✓ Database connection established"));
    } catch (error) {
      console.error(chalk.red("Failed to connect to database:"), error);
      throw new Error("Database connection failed. Migration cannot proceed.");
    }

    // Check the connection to MinIO via ImageService
    console.log("Checking MinIO connection...");
    const connectionTest = await imageService.checkConnection();
    if (!connectionTest) {
      throw new Error("Failed to connect to MinIO. Check your configuration.");
    }

    console.log(chalk.green("✓ Successfully connected to MinIO"));

    // Reload options to ensure we have the optionsService initialised
    await optionsService.reload();

    // Process callout images
    const stats = await processCalloutImages(options);

    // Print summary
    printMigrationSummary(stats, isDryRun);
  } catch (error) {
    console.error(chalk.red("Error during migration:"), error);
    throw error;
  }
}

/**
 * Process callout images from callouts
 * @param options Migration options
 * @returns Migration statistics
 */
async function processCalloutImages(
  options: MigrateImagesOptions
): Promise<MigrationStats> {
  const stats: MigrationStats = {
    successCount: 0,
    skippedCount: 0,
    errorCount: 0,
    totalSizeBytes: 0
  };

  // Get all callouts
  console.log("Fetching callouts...");
  const callouts = await calloutsService.listCallouts();
  console.log(`Found ${callouts.length} callouts`);

  for (const callout of callouts) {
    // Check if the callout has an image
    if (!callout.image) {
      console.log(chalk.gray(`Skipping callout ${callout.id}: No image`));
      continue;
    }

    // Strip query parameters for pattern matching
    const baseImageUrl = callout.image.split("?")[0];

    // Check what type of image URL we have
    if (baseImageUrl.includes("/uploads/")) {
      // Old URL format that needs migration
      try {
        await processCalloutImage(options, callout, stats);
      } catch (error) {
        stats.errorCount++;
        console.error(
          `Error processing image for callout ${callout.id}:`,
          error
        );
      }
    } else if (baseImageUrl.includes("/api/1.0/images/")) {
      // Already using new URL format, skip it
      console.log(
        chalk.cyan(
          `⏭ Skipping callout ${callout.id}: Image already migrated (${callout.image})`
        )
      );
      stats.skippedCount++;
    } else {
      // Attempt to migrate any other format we don't recognize
      console.log(
        chalk.yellow(
          `ℹ Trying to migrate unknown format for callout ${callout.id}: ${callout.image}`
        )
      );
      try {
        await processCalloutImage(options, callout, stats);
      } catch (error) {
        stats.errorCount++;
        console.error(
          `Error processing image for callout ${callout.id}:`,
          error
        );
      }
    }
  }

  return stats;
}

/**
 * Process a single callout image
 * @param options Migration options
 * @param callout The callout with id, slug, and image
 * @param stats Migration statistics to update
 */
async function processCalloutImage(
  options: MigrateImagesOptions,
  callout: { id: string; slug: string; image: string },
  stats: MigrationStats
): Promise<void> {
  let imageKey: string;
  let width: string | null = null;

  // Extract width parameter if present
  const widthMatch = callout.image.match(/[?&]w=(\d+)/);
  if (widthMatch) {
    width = widthMatch[1];
  }

  // Extract the image key from the image URL/path, removing any query parameters
  if (callout.image.includes("/uploads/")) {
    // Format: /uploads/abc123?w=1440
    const uploadPath = callout.image.split("/uploads/")[1];
    imageKey = uploadPath.split("?")[0]; // Remove query parameters
  } else if (!callout.image.includes("/")) {
    // Direct key format: abc123?w=1440
    imageKey = callout.image.split("?")[0]; // Remove query parameters
  } else {
    console.log(
      chalk.yellow(
        `⚠ Unsupported image format for callout ${callout.id}: ${callout.image}`
      )
    );
    stats.errorCount++;
    return;
  }

  console.log(
    chalk.blue(`Extracted image key: ${imageKey} from ${callout.image}`)
  );

  const sourcePath = path.join(options.source, imageKey);
  const mainImage = await findMainImage(sourcePath);

  if (!mainImage) {
    console.log(
      chalk.yellow(
        `⚠ No image found for callout ${callout.id} at ${sourcePath}`
      )
    );
    stats.errorCount++;
    return;
  }

  const filePath = path.join(sourcePath, mainImage);

  // Get file stats for size calculation
  const fileStats = await fs.stat(filePath);

  console.log(
    chalk.blue(
      `Processing image for callout ${callout.id} (${callout.slug}): ${filePath}`
    )
  );

  if (!options.dryRun) {
    try {
      // Read the file as buffer
      const fileBuffer = await fs.readFile(filePath);

      // Upload the image using ImageService
      const uploadedImage = await imageService.uploadImage(fileBuffer);

      // Update the callout with the new image ID, preserving width parameter if it existed
      const newImageUrl = `${config.audience}/api/1.0/images/${uploadedImage.id}${width ? "?w=" + width : ""}`;

      await calloutsService.updateCallout(callout.id, {
        image: newImageUrl
      });

      console.log(
        formatSuccessMessage(
          `${callout.id} (${callout.slug})`,
          fileStats.size
        ) + ` - New image URL: ${newImageUrl}`
      );

      stats.successCount++;
      stats.totalSizeBytes += fileStats.size;
    } catch (error) {
      stats.errorCount++;
      console.error(`Error uploading image for callout ${callout.id}:`, error);
    }
  } else {
    // Dry run mode
    console.log(
      formatDryRunMessage(`${callout.id} (${callout.slug})`, fileStats.size)
    );
    stats.successCount++;
    stats.totalSizeBytes += fileStats.size;
  }
}

/**
 * Print migration summary
 * @param stats Migration statistics
 * @param isDryRun Whether this was a dry run
 */
function printMigrationSummary(stats: MigrationStats, isDryRun: boolean): void {
  console.log(chalk.blue("\nMigration Summary:"));

  if (isDryRun) {
    console.log(chalk.yellow("DRY RUN - No files were actually uploaded"));
    console.log(
      chalk.green(
        `✓ Would migrate: ${stats.successCount} callout images (${formatFileSize(stats.totalSizeBytes)})`
      )
    );
  } else {
    console.log(
      chalk.green(
        `✓ Successfully migrated: ${stats.successCount} callout images (${formatFileSize(stats.totalSizeBytes)})`
      )
    );

    if (stats.skippedCount > 0) {
      console.log(
        chalk.cyan(
          `⏭ Skipped: ${stats.skippedCount} callout images (already migrated or no image)`
        )
      );
    }
  }

  if (stats.errorCount > 0) {
    console.log(
      chalk.red(`✗ Failed to process: ${stats.errorCount} callout images`)
    );
    console.log(chalk.yellow("Please check the logs for details."));
  } else if (stats.successCount > 0 || stats.skippedCount > 0) {
    console.log(chalk.green("✓ Process completed successfully!"));
  } else {
    console.log(chalk.yellow("No callout images found to migrate."));
  }
}
