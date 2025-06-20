import { FormioFile, isFormioFileAnswer } from '@beabee/beabee-common';
import { config } from '@beabee/core/config';
import { connect as connectToDatabase } from '@beabee/core/database';
import { getRepository } from '@beabee/core/database';
import { Content } from '@beabee/core/models/Content';
import { calloutsService } from '@beabee/core/services/CalloutsService';
import { documentService } from '@beabee/core/services/DocumentService';
// Import the required services and utilities from core
import { imageService } from '@beabee/core/services/ImageService';
import { optionsService } from '@beabee/core/services/OptionsService';

import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  MigrateUploadsOptions,
  MigrationStats,
} from '../../types/migrate-uploads.js';
import { findMainImage } from '../../utils/files.js';
import {
  formatDryRunMessage,
  formatFileSize,
  formatSuccessMessage,
} from '../../utils/format.js';

/**
 * Helper function to check if a file URL is already migrated
 * @param fileUrl The file URL to check
 * @returns True if the file is already migrated, false otherwise
 */
function isFileMigrated(fileUrl: string): boolean {
  // Strip query parameters for pattern matching
  const baseFileUrl = fileUrl.split('?')[0];

  // Check if the image URL contains the new API path
  return baseFileUrl.includes('documents/') || baseFileUrl.includes('images/');
}

/**
 * Helper function to extract the image key from a URL
 * @param imageUrl The image URL
 * @returns Object with extracted image key and width
 */
function extractImageInfo(imageUrl: string): {
  imageKey: string | null;
  width: string | null;
} {
  let imageKey: string | null = null;
  let width: string | null = null;

  // Extract width parameter if present
  const widthMatch = imageUrl.match(/[?&]w=(\d+)/);
  if (widthMatch) {
    width = widthMatch[1];
  }

  // Extract the image key from the image URL/path, removing any query parameters
  if (imageUrl.includes('/uploads/')) {
    // Format: /uploads/abc123?w=1440 or /uploads/1440x810/image.jpg
    const uploadPath = imageUrl.split('/uploads/')[1];
    const pathWithoutQuery = uploadPath.split('?')[0]; // Remove query parameters

    if (pathWithoutQuery.includes('/')) {
      // If the path contains additional directories (like size directories),
      // just extract the filename at the end
      imageKey = pathWithoutQuery.split('/').pop() || null;
    } else {
      // Simple path without additional directories
      imageKey = pathWithoutQuery;
    }
  } else if (!imageUrl.includes('/')) {
    // Direct key format without slashes
    imageKey = imageUrl.split('?')[0]; // Remove query parameters
  }

  return { imageKey, width };
}

/**
 * Migrates images from local storage to MinIO using ImageService
 * @param options Migration options
 */
export async function migrateUploads(
  options: MigrateUploadsOptions
): Promise<void> {
  try {
    const isDryRun = options.dryRun === true;
    if (isDryRun) {
      console.log(chalk.yellow('DRY RUN MODE: No files will be uploaded'));
    }
    const steps = options.steps;

    // Initialize database connection
    console.log('Initializing database connection...');
    try {
      await connectToDatabase();
      console.log(chalk.green('✓ Database connection established'));
    } catch (error) {
      console.error(chalk.red('Failed to connect to database:'), error);
      throw new Error('Database connection failed. Migration cannot proceed.');
    }

    // Check the connection to MinIO via ImageService
    console.log('Checking MinIO connection...');
    const connectionTest = await imageService.checkConnection();
    if (!connectionTest) {
      throw new Error('Failed to connect to MinIO. Check your configuration.');
    }

    console.log(chalk.green('✓ Successfully connected to MinIO'));

    // Reload options to ensure we have the optionsService initialised
    await optionsService.reload();

    // Create a stats object to track migration progress
    const stats: MigrationStats = {
      successCount: 0,
      skippedCount: 0,
      errorCount: 0,
      totalSizeBytes: 0,
    };

    // Process callout images
    if (steps.includes('calloutImages')) {
      console.log(chalk.blue('\n=== Migrating Callout Images ==='));
      const calloutStats = await processCalloutImages(options);
      // Merge stats
      stats.successCount += calloutStats.successCount;
      stats.skippedCount += calloutStats.skippedCount;
      stats.errorCount += calloutStats.errorCount;
      stats.totalSizeBytes += calloutStats.totalSizeBytes;
    }

    // Process content images (logo, share image)
    if (steps.includes('optionImages')) {
      console.log(chalk.blue('\n=== Migrating Option Images ==='));
      const optionStats = await processOptionImages(options);
      // Merge stats
      stats.successCount += optionStats.successCount;
      stats.skippedCount += optionStats.skippedCount;
      stats.errorCount += optionStats.errorCount;
      stats.totalSizeBytes += optionStats.totalSizeBytes;
    }

    // Process general content background image
    if (steps.includes('contentBackgroundImage')) {
      console.log(chalk.blue('\n=== Migrating Content Background Image ==='));
      const contentStats = await processContentBackgroundImage(options);
      // Merge stats
      stats.successCount += contentStats.successCount;
      stats.skippedCount += contentStats.skippedCount;
      stats.errorCount += contentStats.errorCount;
      stats.totalSizeBytes += contentStats.totalSizeBytes;
    }

    // Process document and image uploads from callout responses
    if (steps.includes('calloutResponseFiles')) {
      console.log(
        chalk.blue('\n=== Migrating Callout Response Documents and Images ===')
      );
      const documentStats = await processCalloutResponseDocuments(options);
      // Merge stats
      stats.successCount += documentStats.successCount;
      stats.skippedCount += documentStats.skippedCount;
      stats.errorCount += documentStats.errorCount;
      stats.totalSizeBytes += documentStats.totalSizeBytes;
    }

    // Print summary
    printMigrationSummary(stats, isDryRun);
  } catch (error) {
    console.error(chalk.red('Error during migration:'), error);
    throw error;
  }
}

/**
 * Process callout images from callouts
 * @param options Migration options
 * @returns Migration statistics
 */
async function processCalloutImages(
  options: MigrateUploadsOptions
): Promise<MigrationStats> {
  const stats: MigrationStats = {
    successCount: 0,
    skippedCount: 0,
    errorCount: 0,
    totalSizeBytes: 0,
  };

  // Get all callouts
  console.log('Fetching callouts...');
  const callouts = await calloutsService.listCallouts();
  console.log(`Found ${callouts.length} callouts`);

  for (const callout of callouts) {
    // Check if the callout has an image
    if (!callout.image) {
      console.log(chalk.gray(`Skipping callout ${callout.id}: No image`));
      continue;
    }

    // Check if the image is already migrated
    if (isFileMigrated(callout.image)) {
      // Already using new URL format, skip it
      console.log(
        chalk.cyan(
          `⏭ Skipping callout ${callout.id}: Image already migrated (${callout.image})`
        )
      );
      stats.skippedCount++;
    } else if (callout.image.includes('/uploads/')) {
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
 * Process images stored in options settings
 * @param options Migration options
 * @returns Migration statistics
 */
async function processOptionImages(
  options: MigrateUploadsOptions
): Promise<MigrationStats> {
  const stats: MigrationStats = {
    successCount: 0,
    skippedCount: 0,
    errorCount: 0,
    totalSizeBytes: 0,
  };

  // Define which option keys contain images
  const imageOptions = [
    { key: 'logo' as const, label: 'Logo' },
    { key: 'share-image' as const, label: 'Share Image' },
  ];

  console.log('Checking option images...');

  // Process each option that might contain an image
  for (const imageOption of imageOptions) {
    const imageUrl = optionsService.getText(imageOption.key);

    // Skip if no image URL
    if (!imageUrl) {
      console.log(chalk.gray(`Skipping ${imageOption.label}: No image URL`));
      continue;
    }

    // String type assertion for TypeScript
    const imageUrlStr = imageUrl as string;

    // Check if the image is already migrated
    if (isFileMigrated(imageUrlStr)) {
      // Already using new URL format, skip it
      console.log(
        chalk.cyan(
          `⏭ Skipping ${imageOption.label}: Image already migrated (${imageUrlStr})`
        )
      );
      stats.skippedCount++;
    } else if (imageUrlStr.includes('/uploads/')) {
      // Old URL format that needs migration
      try {
        await processOptionImage(
          options,
          imageOption.key,
          imageOption.label,
          imageUrlStr,
          stats
        );
      } catch (error) {
        stats.errorCount++;
        console.error(
          `Error processing image for ${imageOption.label}:`,
          error
        );
      }
    } else {
      // Attempt to migrate any other format we don't recognize
      console.log(
        chalk.yellow(
          `ℹ Trying to migrate unknown format for ${imageOption.label}: ${imageUrlStr}`
        )
      );
      try {
        await processOptionImage(
          options,
          imageOption.key,
          imageOption.label,
          imageUrlStr,
          stats
        );
      } catch (error) {
        stats.errorCount++;
        console.error(
          `Error processing image for ${imageOption.label}:`,
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
  options: MigrateUploadsOptions,
  callout: { id: string; slug: string; image: string },
  stats: MigrationStats
): Promise<void> {
  // Extract image info
  const { imageKey, width } = extractImageInfo(callout.image);

  if (!imageKey) {
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
      const uploadedImage = await imageService.uploadImage(
        fileBuffer,
        mainImage
      );

      // Update the callout with the new image ID, preserving width parameter if it existed
      const newImagePath = `images/${uploadedImage.id}`;
      // const newImageUrl = `${config.audience}/api/1.0/${newImagePath}${width ? "?w=" + width : ""}`;

      await calloutsService.updateCallout(callout.id, {
        image: newImagePath,
      });

      console.log(
        formatSuccessMessage(
          `${callout.id} (${callout.slug})`,
          fileStats.size
        ) + ` - New image path: ${newImagePath}`
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
 * Process a single option image
 * @param options Migration options
 * @param optionKey The option key containing the image URL
 * @param optionLabel Human-readable label for the option
 * @param imageUrl The image URL to process
 * @param stats Migration statistics to update
 */
async function processOptionImage(
  options: MigrateUploadsOptions,
  optionKey: 'logo' | 'share-image',
  optionLabel: string,
  imageUrl: string,
  stats: MigrationStats
): Promise<void> {
  // Extract image info
  const { imageKey, width } = extractImageInfo(imageUrl);

  if (!imageKey) {
    console.log(
      chalk.yellow(
        `⚠ Unsupported image format for ${optionLabel}: ${imageUrl}`
      )
    );
    stats.errorCount++;
    return;
  }

  console.log(chalk.blue(`Extracted image key: ${imageKey} from ${imageUrl}`));

  const sourcePath = path.join(options.source, imageKey);
  const mainImage = await findMainImage(sourcePath);

  if (!mainImage) {
    console.log(
      chalk.yellow(`⚠ No image found for ${optionLabel} at ${sourcePath}`)
    );
    stats.errorCount++;
    return;
  }

  const filePath = path.join(sourcePath, mainImage);

  // Get file stats for size calculation
  const fileStats = await fs.stat(filePath);

  console.log(chalk.blue(`Processing image for ${optionLabel}: ${filePath}`));

  if (!options.dryRun) {
    try {
      // Read the file as buffer
      const fileBuffer = await fs.readFile(filePath);

      // Upload the image using ImageService
      const uploadedImage = await imageService.uploadImage(
        fileBuffer,
        mainImage
      );

      // Update the option with the new image URL, preserving width parameter if it existed
      const newImagePath = `images/${uploadedImage.id}${width ? '?w=' + width : ''}`;
      // const newImageUrl = `${config.audience}/api/1.0/${newImagePath}`;

      // Update directly in OptionsService
      // Use type assertion to allow setting the specific option keys
      await optionsService.set({ [optionKey]: newImagePath });

      console.log(
        formatSuccessMessage(optionLabel, fileStats.size) +
          ` - New image path: ${newImagePath}`
      );

      stats.successCount++;
      stats.totalSizeBytes += fileStats.size;
    } catch (error) {
      stats.errorCount++;
      console.error(`Error uploading image for ${optionLabel}:`, error);
    }
  } else {
    // Dry run mode
    console.log(formatDryRunMessage(optionLabel, fileStats.size));
    stats.successCount++;
    stats.totalSizeBytes += fileStats.size;
  }
}

/**
 * Process document and image uploads from callout responses
 * @param options Migration options
 * @returns Migration statistics
 */
async function processCalloutResponseDocuments(
  options: MigrateUploadsOptions
): Promise<MigrationStats> {
  const stats: MigrationStats = {
    successCount: 0,
    skippedCount: 0,
    errorCount: 0,
    totalSizeBytes: 0,
  };

  // Get all callout responses that have file uploads
  console.log(
    'Fetching callout responses with file uploads (documents and images)...'
  );
  const responses = await calloutsService.listResponsesWithFileUploads();
  console.log(`Found ${responses.length} responses with file uploads`);

  // Iterate through each response
  for (const response of responses) {
    // Process each slide in the response
    for (const slideId in response.answers) {
      const slideAnswers = response.answers[slideId];
      if (!slideAnswers) continue;

      // Process each component in the slide
      for (const componentKey in slideAnswers) {
        const answer = slideAnswers[componentKey];

        // Process the answer or array of answers
        if (Array.isArray(answer)) {
          // If it's an array of answers, process each one
          for (let i = 0; i < answer.length; i++) {
            const item = answer[i];
            if (!isFormioFileAnswer(item)) {
              // Not a file upload
              continue;
            }

            try {
              const updated = await processFileUpload(
                options,
                response,
                slideId,
                componentKey,
                item,
                i,
                stats
              );
              if (updated) {
                // Update the answer in the array if it was successfully migrated
                answer[i] = updated;
              }
            } catch (error) {
              stats.errorCount++;
              console.error(
                `Error processing file for response ${response.id}:`,
                error
              );
            }
          }
        } else if (isFormioFileAnswer(answer)) {
          try {
            const updated = await processFileUpload(
              options,
              response,
              slideId,
              componentKey,
              answer,
              null,
              stats
            );
            if (updated) {
              // Update the answer if it was successfully migrated
              slideAnswers[componentKey] = updated;
            }
          } catch (error) {
            stats.errorCount++;
            console.error(
              `Error processing file for response ${response.id}:`,
              error
            );
          }
        } else {
          // Not a file upload
          continue;
        }
      }
    }
  }

  return stats;
}

/**
 * Process a single file upload (document or image)
 * @param options Migration options
 * @param response The callout response containing the file
 * @param slideId The slide ID containing the file
 * @param componentKey The component key containing the file
 * @param fileUpload The file upload answer
 * @param arrayIndex Optional index if the answer is in an array
 * @param stats Migration statistics to update
 * @returns Updated file upload object if migrated, null otherwise
 */
async function processFileUpload(
  options: MigrateUploadsOptions,
  response: { id: string; calloutId?: string; answers: any },
  slideId: string,
  componentKey: string,
  fileUpload: FormioFile,
  arrayIndex: number | null,
  stats: MigrationStats
): Promise<{ url: string; path: string } | null> {
  const fileUrl = fileUpload.url;
  const locationInfo =
    arrayIndex !== null
      ? `response ${response.id}, slide ${slideId}, component ${componentKey}, index ${arrayIndex}`
      : `response ${response.id}, slide ${slideId}, component ${componentKey}`;

  // Check if the file is already migrated using the existing function
  if (isFileMigrated(fileUrl)) {
    console.log(
      chalk.cyan(
        `⏭ Skipping file in ${locationInfo}: Already migrated (${fileUrl})`
      )
    );
    stats.skippedCount++;
    return null;
  }

  // Extract file key from URL
  const { documentKey } = extractDocumentInfo(fileUrl);

  if (!documentKey) {
    console.log(
      chalk.yellow(`⚠ Unsupported file format in ${locationInfo}: ${fileUrl}`)
    );
    stats.errorCount++;
    return null;
  }

  console.log(chalk.blue(`Extracted file key: ${documentKey} from ${fileUrl}`));

  const sourcePath = path.join(options.source, documentKey);

  // Verify the file exists
  try {
    await fs.access(sourcePath);
  } catch (error) {
    console.log(
      chalk.yellow(`⚠ No file found for ${locationInfo} at ${sourcePath}`)
    );
    stats.errorCount++;
    return null;
  }

  // Get file stats for size calculation
  const fileStats = await fs.stat(sourcePath);

  // Determine if this is an image or a document based on file extension
  const fileName =
    fileUpload.originalName || fileUpload.name || path.basename(sourcePath);
  const fileExt = path.extname(fileName).toLowerCase();
  const isImage = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.avif',
    '.svg',
    '.tiff',
    '.tif',
    '.heif',
    '.heic',
    '.jp2',
  ].includes(fileExt);

  const fileType = isImage ? 'image' : 'document';
  console.log(
    chalk.blue(`Processing ${fileType} for ${locationInfo}: ${sourcePath}`)
  );

  if (!options.dryRun) {
    try {
      // Read the file as buffer
      const fileBuffer = await fs.readFile(sourcePath);

      if (isImage) {
        // Handle as image using ImageService
        const uploadedImage = await imageService.uploadImage(
          fileBuffer,
          fileName
        );

        // Update with the new image URL
        const newImagePath = `images/${uploadedImage.id}`;
        const newImageUrl = `${config.audience}/api/1.0/${newImagePath}`;

        // Update the response with the new image URL
        const updated = await calloutsService.updateResponseFileUploadUrl(
          response.id,
          slideId,
          componentKey,
          arrayIndex,
          { ...fileUpload, url: newImageUrl, path: newImagePath }
        );

        if (updated) {
          console.log(
            formatSuccessMessage(
              `${fileType} in ${locationInfo}`,
              fileStats.size
            ) + ` - New image path: ${newImagePath}`
          );

          stats.successCount++;
          stats.totalSizeBytes += fileStats.size;
          return { url: newImageUrl, path: newImagePath };
        } else {
          stats.errorCount++;
          console.error(`Failed to update image URL for ${locationInfo}`);
          return null;
        }
      } else {
        // Handle as document using DocumentService
        const uploadedDocument = await documentService.uploadDocument(
          fileBuffer,
          fileUpload.originalName || fileUpload.name
        );

        // Update with the new document URL
        const newDocumentPath = `documents/${uploadedDocument.id}`;
        const newDocumentUrl = `${config.audience}/api/1.0/${newDocumentPath}`;

        // Update the response with the new document URL using CalloutsService
        const updated = await calloutsService.updateResponseFileUploadUrl(
          response.id,
          slideId,
          componentKey,
          arrayIndex,
          { ...fileUpload, url: newDocumentUrl, path: newDocumentPath }
        );

        if (updated) {
          console.log(
            formatSuccessMessage(
              `${fileType} in ${locationInfo}`,
              fileStats.size
            ) + ` - New document path: ${newDocumentPath}`
          );

          stats.successCount++;
          stats.totalSizeBytes += fileStats.size;
          return { url: newDocumentUrl, path: newDocumentPath };
        } else {
          stats.errorCount++;
          console.error(`Failed to update document URL for ${locationInfo}`);
          return null;
        }
      }
    } catch (error) {
      stats.errorCount++;
      console.error(`Error uploading ${fileType} for ${locationInfo}:`, error);
      return null;
    }
  } else {
    // Dry run mode
    console.log(
      formatDryRunMessage(`${fileType} in ${locationInfo}`, fileStats.size)
    );
    stats.successCount++;
    stats.totalSizeBytes += fileStats.size;
    return null;
  }
}

/**
 * Helper function to extract the document key from a URL
 * @param documentUrl The document URL
 * @returns Object with extracted document key
 */
function extractDocumentInfo(documentUrl: string): {
  documentKey: string | null;
} {
  let documentKey: string | null = null;

  // Extract the document key from the document URL/path, removing any query parameters
  if (documentUrl.includes('/uploads/')) {
    // Format: /uploads/abc123 or /uploads/directory/filename.ext
    const uploadPath = documentUrl.split('/uploads/')[1];
    const pathWithoutQuery = uploadPath.split('?')[0]; // Remove query parameters

    // Extract the filename
    const filename = path.basename(pathWithoutQuery);

    // If path has directories, combine them with the filename
    if (pathWithoutQuery.includes('/')) {
      documentKey = filename;
    } else {
      // Simple path without additional directories
      documentKey = pathWithoutQuery + '/' + filename;
    }
  } else if (!documentUrl.includes('/')) {
    // Direct key format without slashes
    documentKey = documentUrl.split('?')[0]; // Remove query parameters
  }

  return { documentKey };
}

/**
 * Process the background image from general content
 * @param options Migration options
 * @returns Migration statistics
 */
async function processContentBackgroundImage(
  options: MigrateUploadsOptions
): Promise<MigrationStats> {
  const stats: MigrationStats = {
    successCount: 0,
    skippedCount: 0,
    errorCount: 0,
    totalSizeBytes: 0,
  };

  console.log('Checking general content background image...');

  // Fetch the general content from database
  const generalContent = await getRepository(Content).findOneBy({
    id: 'general',
  });

  // Skip if no content found
  if (!generalContent) {
    console.log(chalk.gray(`Skipping general content: Content not found`));
    return stats;
  }

  // Get the background URL from the content data
  const backgroundUrl = generalContent.data.backgroundUrl as string;

  // Skip if no background URL
  if (!backgroundUrl) {
    console.log(
      chalk.gray(`Skipping general content: No background image URL`)
    );
    return stats;
  }

  // Check if the image is already migrated
  if (isFileMigrated(backgroundUrl)) {
    // Already using new URL format, skip it
    console.log(
      chalk.cyan(
        `⏭ Skipping general content background: Image already migrated (${backgroundUrl})`
      )
    );
    stats.skippedCount++;
    return stats;
  } else if (backgroundUrl.includes('/uploads/')) {
    // Old URL format that needs migration
    try {
      await processGeneralBackgroundImage(options, backgroundUrl, stats);
    } catch (error) {
      stats.errorCount++;
      console.error(
        `Error processing background image for general content:`,
        error
      );
    }
  } else if (backgroundUrl) {
    // Attempt to migrate any other format we don't recognize
    console.log(
      chalk.yellow(
        `ℹ Trying to migrate unknown format for general content background: ${backgroundUrl}`
      )
    );
    try {
      await processGeneralBackgroundImage(options, backgroundUrl, stats);
    } catch (error) {
      stats.errorCount++;
      console.error(
        `Error processing background image for general content:`,
        error
      );
    }
  }

  return stats;
}

/**
 * Process the general content background image
 * @param options Migration options
 * @param backgroundUrl The background image URL
 * @param stats Migration statistics to update
 */
async function processGeneralBackgroundImage(
  options: MigrateUploadsOptions,
  backgroundUrl: string,
  stats: MigrationStats
): Promise<void> {
  // Extract image info
  const { imageKey, width } = extractImageInfo(backgroundUrl);

  if (!imageKey) {
    console.log(
      chalk.yellow(
        `⚠ Unsupported image format for general content background: ${backgroundUrl}`
      )
    );
    stats.errorCount++;
    return;
  }

  console.log(
    chalk.blue(`Extracted image key: ${imageKey} from ${backgroundUrl}`)
  );

  const sourcePath = path.join(options.source, imageKey);
  const mainImage = await findMainImage(sourcePath);

  if (!mainImage) {
    console.log(
      chalk.yellow(
        `⚠ No image found for general content background at ${sourcePath}`
      )
    );
    stats.errorCount++;
    return;
  }

  const filePath = path.join(sourcePath, mainImage);

  // Get file stats for size calculation
  const fileStats = await fs.stat(filePath);

  console.log(
    chalk.blue(`Processing background image for general content: ${filePath}`)
  );

  if (!options.dryRun) {
    try {
      // Read the file as buffer
      const fileBuffer = await fs.readFile(filePath);

      // Upload the image using ImageService
      const uploadedImage = await imageService.uploadImage(
        fileBuffer,
        mainImage
      );

      // Update the general content with the new image URL, preserving width parameter if it existed
      const newImagePath = `images/${uploadedImage.id}${width ? '?w=' + width : ''}`;

      // Update the backgroundUrl in the content data
      await getRepository(Content)
        .createQueryBuilder()
        .update(Content)
        .set({
          data: () =>
            `jsonb_set("data", '{backgroundUrl}', '"${newImagePath}"')`,
        })
        .where('id = :id', { id: 'general' })
        .execute();

      console.log(
        formatSuccessMessage('General content background', fileStats.size) +
          ` - New image path: ${newImagePath}`
      );

      stats.successCount++;
      stats.totalSizeBytes += fileStats.size;
    } catch (error) {
      stats.errorCount++;
      console.error(
        `Error uploading background image for general content:`,
        error
      );
    }
  } else {
    // Dry run mode
    console.log(
      formatDryRunMessage('General content background', fileStats.size)
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
  console.log(chalk.blue('\nMigration Summary:'));

  if (isDryRun) {
    console.log(chalk.yellow('DRY RUN - No files were actually uploaded'));
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
          `⏭ Skipped: ${stats.skippedCount} files (already migrated or no file)`
        )
      );
    }
  }

  if (stats.errorCount > 0) {
    console.log(chalk.red(`✗ Failed to process: ${stats.errorCount} files`));
    console.log(chalk.yellow('Please check the logs for details.'));
  } else if (stats.successCount > 0 || stats.skippedCount > 0) {
    console.log(chalk.green('✓ Process completed successfully!'));
  } else {
    console.log(chalk.yellow('No files found to migrate.'));
  }
}
