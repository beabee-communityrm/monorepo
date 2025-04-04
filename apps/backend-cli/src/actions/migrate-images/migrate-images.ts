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
import {
  createS3Client,
  checkBucketExists,
  checkFileExists,
  uploadFileToS3
} from "../../utils/s3.js";

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

    // Initialize S3 client and check bucket
    const s3Client = createS3Client(
      options.endpoint,
      options.region,
      options.accessKey,
      options.secretKey
    );

    await checkBucketExists(s3Client, options.bucket);

    // Process all images
    const stats = await processAllImages(s3Client, options);

    // Print summary
    printMigrationSummary(stats, isDryRun);
  } catch (error) {
    console.error(chalk.red("Error during migration:"), error);
    throw error;
  }
}

/**
 * Process all images from source directory
 * @param s3Client S3 client
 * @param options Migration options
 * @returns Migration statistics
 */
async function processAllImages(
  s3Client: any,
  options: MigrateImagesOptions
): Promise<MigrationStats> {
  const stats: MigrationStats = {
    successCount: 0,
    skippedCount: 0,
    errorCount: 0,
    totalSizeBytes: 0
  };

  // Analyze PictShare storage structure
  console.log(`Analyzing PictShare storage in ${options.source}...`);

  // Get all directories in the source folder
  const directories = await findImageDirectories(options.source);
  console.log(`Found ${directories.length} image directories`);

  // Process each directory
  for (const dir of directories) {
    try {
      await processImageDirectory(s3Client, options, dir, stats);
    } catch (error) {
      stats.errorCount++;
      console.error(`Error processing directory ${dir}:`, error);
    }
  }

  return stats;
}

/**
 * Process a single image directory
 * @param s3Client S3 client
 * @param options Migration options
 * @param dirName Directory name
 * @param stats Migration statistics to update
 */
async function processImageDirectory(
  s3Client: any,
  options: MigrateImagesOptions,
  dirName: string,
  stats: MigrationStats
): Promise<void> {
  const dirPath = path.join(options.source, dirName);
  const mainImage = await findMainImage(dirPath);

  if (!mainImage) {
    return; // No valid image found in this directory
  }

  const filePath = path.join(dirPath, mainImage);
  // Use the directory name as the image key (without nested folder)
  const s3Key = dirName;

  // Get file stats for size calculation
  const fileStats = await fs.stat(filePath);

  // Check if file already exists in S3
  if (!options.dryRun) {
    const fileExists = await checkFileExists(s3Client, options.bucket, s3Key);

    if (fileExists) {
      console.log(formatSkipMessage(s3Key));
      stats.skippedCount++;
      return;
    }
  }

  // Process the file
  await processFile(s3Client, options, filePath, s3Key, fileStats.size, stats);
}

/**
 * Process an individual file
 * @param s3Client S3 client
 * @param options Migration options
 * @param filePath Local file path
 * @param s3Key S3 object key
 * @param fileSize File size in bytes
 * @param stats Migration statistics to update
 */
async function processFile(
  s3Client: any,
  options: MigrateImagesOptions,
  filePath: string,
  s3Key: string,
  fileSize: number,
  stats: MigrationStats
): Promise<void> {
  stats.totalSizeBytes += fileSize;

  if (!options.dryRun) {
    // Upload file to S3
    await uploadFileToS3(s3Client, options.bucket, s3Key, filePath);
    console.log(formatSuccessMessage(s3Key, fileSize));
  } else {
    console.log(formatDryRunMessage(s3Key, fileSize));
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
