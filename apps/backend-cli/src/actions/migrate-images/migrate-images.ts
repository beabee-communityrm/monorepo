import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";

import {
  MigrateImagesOptions,
  MigrationStats
} from "../../types/migrate-images.js";
import { findImageDirectories, findMainImage } from "../../utils/files.js";
import {
  formatFileSize,
  formatSuccessMessage,
  formatSkipMessage,
  formatDryRunMessage
} from "../../utils/format.js";

// Import the ImageService for processing images
import { ImageService } from "@beabee/core/services/ImageService";
import { S3Service } from "@beabee/core/services/S3Service";

/**
 * Migrates images from local storage to MinIO
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

    const s3Config = {
      endpoint: options.endpoint,
      region: options.region,
      accessKey: options.accessKey,
      secretKey: options.secretKey,
      bucket: options.bucket
    };

    // Initialize ImageService with custom S3 configuration
    const imageService = new ImageService({
      s3Config
    });

    const s3Service = new S3Service(s3Config);

    // Check bucket exists
    await s3Service.checkBucketExists(options.bucket);

    // Process all images
    const stats = await processAllImages(options, imageService, s3Service);

    // Print summary
    printMigrationSummary(stats, isDryRun);
  } catch (error) {
    console.error(chalk.red("Error during migration:"), error);
    throw error;
  }
}

/**
 * Process all images from source directory
 * @param options Migration options
 * @param imageService ImageService instance
 * @returns Migration statistics
 */
async function processAllImages(
  options: MigrateImagesOptions,
  imageService: ImageService,
  s3Service: S3Service
): Promise<MigrationStats> {
  const stats: MigrationStats = {
    successCount: 0,
    skippedCount: 0,
    errorCount: 0,
    totalSizeBytes: 0,
    variantsCreated: 0
  };

  // Analyze PictShare storage structure
  console.log(`Analyzing PictShare storage in ${options.source}...`);

  // Get all directories in the source folder
  const directories = await findImageDirectories(options.source);
  console.log(`Found ${directories.length} image directories`);

  // Process each directory
  for (const dir of directories) {
    try {
      await processImageDirectory(options, dir, stats, imageService, s3Service);
    } catch (error) {
      stats.errorCount++;
      console.error(`Error processing directory ${dir}:`, error);
    }
  }

  return stats;
}

/**
 * Process a single image directory
 * @param options Migration options
 * @param dirName Directory name
 * @param stats Migration statistics to update
 * @param imageService ImageService instance
 */
async function processImageDirectory(
  options: MigrateImagesOptions,
  dirName: string,
  stats: MigrationStats,
  imageService: ImageService,
  s3Service: S3Service
): Promise<void> {
  const dirPath = path.join(options.source, dirName);
  const mainImage = await findMainImage(dirPath);

  if (!mainImage) {
    return; // No valid image found in this directory
  }

  const filePath = path.join(dirPath, mainImage);

  // Get file stats for size calculation
  const fileStats = await fs.stat(filePath);
  const fileSize = fileStats.size;

  // Check if file already exists in S3
  // We use the directory name as a key
  if (!options.dryRun) {
    const fileExists = await s3Service.checkFileExists(dirName);

    if (fileExists) {
      console.log(formatSkipMessage(dirName));
      stats.skippedCount++;
      return;
    }
  }

  // Process the file
  await processFile(
    options,
    filePath,
    dirName,
    fileSize,
    stats,
    imageService,
    s3Service
  );
}

/**
 * Process an individual file
 * @param options Migration options
 * @param filePath Local file path
 * @param s3Key S3 object key
 * @param fileSize File size in bytes
 * @param stats Migration statistics to update
 * @param imageService ImageService instance
 */
async function processFile(
  options: MigrateImagesOptions,
  filePath: string,
  s3Key: string,
  fileSize: number,
  stats: MigrationStats,
  imageService: ImageService,
  s3Service: S3Service
): Promise<void> {
  stats.totalSizeBytes += fileSize;

  if (!options.dryRun) {
    const createVariants = options.createVariants !== false;
    const preserveFormat = options.preserveFormat === true;

    try {
      // Read the file as buffer
      const fileBuffer = await fs.readFile(filePath);
      const fileName = path.basename(filePath);

      if (createVariants) {
        // Use the standard upload method from ImageService
        // This will handle variant creation automatically
        const urls = await imageService.uploadFile(
          fileBuffer,
          fileName,
          undefined, // No prefix
          true, // Preserve original filename
          !preserveFormat // Convert format only if preserveFormat is false
        );

        // Count the variants created (subtract 1 for the original)
        const variantCount = Object.keys(urls).length - 1;
        stats.variantsCreated += variantCount;

        const formatMsg = preserveFormat ? " (original format preserved)" : "";
        console.log(
          formatSuccessMessage(s3Key, fileSize, variantCount) + formatMsg
        );
      } else {
        // Upload the original file directly (without creating variants)
        // We still use uploadFile but make note that no variants were created
        await s3Service.uploadFile(
          s3Key,
          filePath,
          imageService.getContentType(filePath)
        );
        console.log(formatSuccessMessage(s3Key, fileSize, 0));
      }
    } catch (error) {
      console.error(`Error processing file ${s3Key}:`, error);

      // Fallback to direct upload if standard method fails
      try {
        await s3Service.uploadFile(
          s3Key,
          filePath,
          imageService.getContentType(filePath)
        );
        console.log(
          formatSuccessMessage(s3Key, fileSize, 0) + " (fallback upload)"
        );
      } catch (uploadError) {
        console.error(`Fallback upload failed for ${s3Key}:`, uploadError);
        throw uploadError;
      }
    }
  } else {
    const variantMsg =
      options.createVariants !== false
        ? " (with variants)"
        : " (original only)";
    const formatMsg =
      options.preserveFormat === true ? " (original format preserved)" : "";
    console.log(formatDryRunMessage(s3Key, fileSize) + variantMsg + formatMsg);
  }

  stats.successCount++;
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
        `✓ Would migrate: ${stats.successCount} files (${formatFileSize(stats.totalSizeBytes)})`
      )
    );
  } else {
    console.log(
      chalk.green(
        `✓ Successfully migrated: ${stats.successCount} files (${formatFileSize(stats.totalSizeBytes)})`
      )
    );

    if (stats.variantsCreated > 0) {
      console.log(
        chalk.green(`✓ Created ${stats.variantsCreated} image variants`)
      );
    }

    if (stats.skippedCount > 0) {
      console.log(
        chalk.cyan(
          `⏭ Skipped: ${stats.skippedCount} files (already existed in bucket)`
        )
      );
    }
  }

  if (stats.errorCount > 0) {
    console.log(
      chalk.red(`✗ Failed to process: ${stats.errorCount} directories`)
    );
    console.log(chalk.yellow("Please check the logs for details."));
  } else if (stats.successCount > 0 || stats.skippedCount > 0) {
    console.log(chalk.green("✓ Process completed successfully!"));
  } else {
    console.log(chalk.yellow("No files found to migrate."));
  }
}
