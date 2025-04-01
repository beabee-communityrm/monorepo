import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { createReadStream } from "node:fs";
import chalk from "chalk";
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand
} from "@aws-sdk/client-s3";

export interface MigrateImagesOptions {
  source: string;
  bucket: string;
  endpoint: string;
  accessKey: string;
  secretKey: string;
  region: string;
  dryRun?: boolean;
}

const readdir = promisify(fs.readdir);

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

    // Initialize S3 client
    const s3Client = new S3Client({
      endpoint: options.endpoint,
      region: options.region,
      credentials: {
        accessKeyId: options.accessKey,
        secretAccessKey: options.secretKey
      },
      forcePathStyle: true
    });

    // Check if bucket exists
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: options.bucket }));
      console.log(chalk.green(`✓ Connected to bucket '${options.bucket}'`));
    } catch (error) {
      console.error(
        chalk.red(
          `Error: Bucket '${options.bucket}' not found or not accessible`
        )
      );
      console.error(
        "Please make sure the bucket exists and you have the correct permissions"
      );
      throw error;
    }

    // Analyze PictShare storage structure
    console.log(`Analyzing PictShare storage in ${options.source}...`);

    // Get all directories in the source folder
    const directories = (
      await fs.promises.readdir(options.source, { withFileTypes: true })
    )
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    console.log(`Found ${directories.length} image directories`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let totalSizeBytes = 0;

    for (const dir of directories) {
      try {
        const dirPath = path.join(options.source, dir);
        const files = await fs.promises.readdir(dirPath);

        // Find the main image (the one without a prefix)
        const mainImage = files.find(
          (file) =>
            !file.includes("_") &&
            file !== "deletecode" &&
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
        );

        if (mainImage) {
          const filePath = path.join(dirPath, mainImage);
          // Use the directory name as the image key (without nested folder)
          const s3Key = dir;

          // Get file stats for size calculation
          const stats = await fs.promises.stat(filePath);

          // Check if file already exists in S3
          let fileExists = false;
          if (!isDryRun) {
            try {
              await s3Client.send(
                new HeadObjectCommand({
                  Bucket: options.bucket,
                  Key: s3Key
                })
              );
              // If no error is thrown, the object exists
              fileExists = true;
              console.log(
                chalk.cyan(`⏭ Skipped: ${s3Key} (already exists in bucket)`)
              );
              skippedCount++;
            } catch (err) {
              // Object doesn't exist, proceed with upload
              fileExists = false;
            }
          }

          if (!fileExists) {
            totalSizeBytes += stats.size;

            if (!isDryRun) {
              // Upload file to S3
              await s3Client.send(
                new PutObjectCommand({
                  Bucket: options.bucket,
                  Key: s3Key,
                  Body: fs.createReadStream(filePath),
                  ContentType: getContentType(filePath)
                })
              );
              console.log(
                chalk.green(
                  `✓ Migrated: ${s3Key} (${formatFileSize(stats.size)})`
                )
              );
              successCount++;
            } else {
              console.log(
                chalk.blue(
                  `Would migrate: ${s3Key} (${formatFileSize(stats.size)})`
                )
              );
              successCount++;
            }
          }
        }
      } catch (error) {
        errorCount++;
        console.error(`Error processing directory ${dir}:`, error);
      }
    }

    // Summary
    console.log(chalk.blue("\nMigration Summary:"));
    if (isDryRun) {
      console.log(chalk.yellow("DRY RUN - No files were actually uploaded"));
      console.log(
        chalk.green(
          `✓ Would migrate: ${successCount} files (${formatFileSize(totalSizeBytes)})`
        )
      );
    } else {
      console.log(
        chalk.green(
          `✓ Successfully migrated: ${successCount} files (${formatFileSize(totalSizeBytes)})`
        )
      );
      if (skippedCount > 0) {
        console.log(
          chalk.cyan(
            `⏭ Skipped: ${skippedCount} files (already existed in bucket)`
          )
        );
      }
    }

    if (errorCount > 0) {
      console.log(chalk.red(`✗ Failed to process: ${errorCount} directories`));
      console.log(chalk.yellow("Please check the logs for details."));
    } else if (successCount > 0 || skippedCount > 0) {
      console.log(chalk.green("✓ Process completed successfully!"));
    } else {
      console.log(chalk.yellow("No files found to migrate."));
    }
  } catch (error) {
    console.error(chalk.red("Error during migration:"), error);
    throw error;
  }
}

/**
 * Recursively get all files in a directory
 * @param dir Directory to scan
 * @returns List of file paths
 */
export async function getAllFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? await getAllFiles(fullPath) : fullPath;
    })
  );

  return files.flat();
}

/**
 * Format file size in human readable format
 * @param bytes File size in bytes
 * @returns Formatted file size
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
  else return (bytes / 1073741824).toFixed(2) + " GB";
}

/**
 * Get content type based on file extension
 * @param filePath Path to file
 * @returns MIME type for the file
 */
export function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".mp4":
      return "video/mp4";
    default:
      return "application/octet-stream";
  }
}
