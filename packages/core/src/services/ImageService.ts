import sharp from "sharp";
import { Readable } from "stream";
import path from "path";
import config from "#config/config";
import { BadRequestError, NotFoundError } from "../errors";
import type { Response } from "express";

import { S3Service, S3Config } from "./S3Service";

/**
 * Default image size variations to generate
 */
const IMAGE_SIZES = [
  { key: "original", width: null },
  { key: "sm", width: 400 },
  { key: "md", width: 600 },
  { key: "lg", width: 1440 },
  { key: "xl", width: 2560 }
];

/**
 * Output format for resized images (AVIF has better compression than WebP)
 */
const OUTPUT_FORMAT = "avif" as const;

/**
 * Quality setting for AVIF (0-100)
 */
const OUTPUT_QUALITY = 65;

/**
 * Supported image mime types for resizing
 */
const RESIZABLE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif"
];

/**
 * Options for image streaming
 */
interface StreamOptions {
  width?: number | undefined;
  height?: number | undefined;
}

/**
 * Configuration options for ImageService
 */
export interface ImageServiceConfig {
  s3Config?: Partial<S3Config>;
  imageSizes?: typeof IMAGE_SIZES;
  outputFormat?: typeof OUTPUT_FORMAT;
  outputQuality?: number;
}

/**
 * Processed image with its URL
 */
interface ProcessedImage {
  url: string;
  contentType: string;
  fileKey: string;
  buffer: Buffer;
}

/**
 * Service for handling image uploads, processing, and streaming
 */
export class ImageService {
  private s3Service: S3Service;
  private imageSizes: typeof IMAGE_SIZES;
  private outputFormat: typeof OUTPUT_FORMAT;
  private outputQuality: number;

  constructor(config?: ImageServiceConfig) {
    // Initialize S3 service with provided config or default
    this.s3Service = new S3Service(config?.s3Config);

    // Set image processing options
    this.imageSizes = config?.imageSizes || IMAGE_SIZES;
    this.outputFormat = config?.outputFormat || OUTPUT_FORMAT;
    this.outputQuality = config?.outputQuality || OUTPUT_QUALITY;
  }

  /**
   * Upload a file to storage and process image variations if it's an image
   * @param fileBuffer The file buffer to upload
   * @param fileName Original filename (used to determine content type)
   * @param prefix Optional folder prefix for the file
   * @param preserveOriginalName Whether to preserve the exact original filename (for migration)
   * @param convertFormat Whether to convert image format to the configured output format (default: true)
   * @returns Object with URLs for all generated versions
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    prefix = "",
    preserveOriginalName = false,
    convertFormat = true
  ): Promise<{ [key: string]: string }> {
    try {
      // Generate a unique key for the file
      const fileKey = this.generateUniqueKey(
        fileName,
        prefix,
        preserveOriginalName
      );
      const contentType = this.getContentType(fileName);

      // Check if this is an image that needs processing
      const isResizableImage = RESIZABLE_MIME_TYPES.includes(contentType);

      if (isResizableImage) {
        return await this.processAndUploadImage(
          fileBuffer,
          fileKey,
          contentType,
          convertFormat
        );
      } else {
        // For non-image files, just upload the original
        await this.s3Service.uploadBuffer(fileKey, fileBuffer, contentType);

        return {
          original: this.generatePublicUrl(fileKey)
        };
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new BadRequestError({ message: "Failed to upload file" });
    }
  }

  /**
   * Delete a file and all its variations from storage
   * @param fileKey The file key to delete
   */
  async deleteFile(fileKey: string): Promise<void> {
    try {
      // Get base key without size suffix
      const baseKey = this.getBaseKey(fileKey);

      // Delete all size variations
      await Promise.all(
        this.imageSizes.map(async (size) => {
          const key = this.getKeyForSize(baseKey, size.key);

          try {
            await this.s3Service.deleteFile(key);
          } catch (err) {
            // Ignore errors if the file doesn't exist
            console.warn(`Failed to delete ${key}`, err);
          }
        })
      );
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new BadRequestError({ message: "Failed to delete file" });
    }
  }

  /**
   * Get a file stream from storage
   * @param fileKey The file key
   * @returns Readable stream of the file
   */
  private async getFileStream(fileKey: string): Promise<Readable> {
    return await this.s3Service.getFileStream(fileKey);
  }

  /**
   * Stream a file with optional transformations
   * This is a higher-level function that handles different file types and resizing options
   *
   * @param filename The filename to stream
   * @param options Stream options (e.g., width, height)
   * @param response Express Response object to pipe to
   */
  async streamFile(
    filename: string,
    options: StreamOptions,
    response: Response
  ): Promise<void> {
    try {
      // Get content type before any streaming operations
      const contentType = this.getContentType(filename);

      // Set content type header only once at the beginning
      response.setHeader("Content-Type", contentType);

      const isResizableImage = RESIZABLE_MIME_TYPES.includes(contentType);

      // For non-image files or when no resize options are provided, stream directly
      if (!isResizableImage || (!options.width && !options.height)) {
        try {
          const stream = await this.getFileStream(filename);
          stream.pipe(response);
        } catch (error) {
          // Don't set headers again, just log and throw
          console.error(`Error streaming file ${filename}:`, error);
          if (!response.headersSent) {
            response.status(404);
          }
          throw new NotFoundError({ message: "File not found" });
        }
        return;
      }

      // For images with resize options, try to find the best variant or resize dynamically
      await this.streamImageWithOptions(filename, options, response);
    } catch (error) {
      // Ensure we don't set headers if they've already been sent
      if (!response.headersSent) {
        response.status(error instanceof NotFoundError ? 404 : 500);
      }

      // If the error hasn't been sent to the client yet, end the response with the error
      if (!response.writableEnded) {
        if (
          error instanceof BadRequestError ||
          error instanceof NotFoundError
        ) {
          response.end(error.message);
        } else {
          console.error("Error streaming file:", error);
          response.end("File not found or error processing the file");
        }
      }
    }
  }

  /**
   * Stream an image with resizing options
   * @param filename Filename to stream
   * @param options Resizing options
   * @param response Express response to pipe to
   */
  private async streamImageWithOptions(
    filename: string,
    options: StreamOptions,
    response: Response
  ): Promise<void> {
    const targetWidth = options.width;
    const targetHeight = options.height;

    try {
      // Check if file exists in S3 before proceeding
      await this.s3Service.checkFileExists(filename);

      // Try to find an existing variant that matches or is close to the requested size
      const bestVariant = this.findBestSizeVariant(targetWidth, targetHeight);
      if (bestVariant && bestVariant !== "original") {
        try {
          await this.streamVariant(filename, bestVariant, response);
          return;
        } catch (err) {
          // Don't throw, just log and continue with dynamic resizing
          console.warn(
            `Variant ${bestVariant} not found for ${filename}, using dynamic resizing`
          );
        }
      }

      // Dynamic resizing as fallback
      await this.streamResizedImage(
        filename,
        targetWidth,
        targetHeight,
        response
      );
    } catch (error) {
      console.error(`Error streaming image ${filename}:`, error);

      // Only try original as fallback if we haven't sent headers yet
      if (!response.headersSent && !response.writableEnded) {
        try {
          const stream = await this.getFileStream(filename);
          stream.pipe(response);
        } catch (finalError) {
          throw new NotFoundError({ message: "File not found" });
        }
      } else {
        // If headers were already sent, we need to end the response
        if (!response.writableEnded) {
          response.end();
        }
        throw new NotFoundError({ message: "File not found" });
      }
    }
  }

  /**
   * Stream an existing variant of an image
   *
   * @param filename Base filename
   * @param sizeKey Size variant key (e.g., "sm", "md", "lg")
   * @param response Express Response object to pipe to
   */
  async streamVariant(
    filename: string,
    sizeKey: string,
    response: Response
  ): Promise<void> {
    // Don't set content type header here as it's already set in streamFile

    // Check if the filename already contains a size suffix
    if (this.hasSizeSuffix(filename)) {
      // If it does, use it as is
      const stream = await this.getFileStream(filename);
      stream.pipe(response);
      return;
    }

    // Get variant filename
    const variantFilename = await this.getVariantFilename(filename, sizeKey);

    try {
      // Get and stream the variant without setting content type again
      const stream = await this.getFileStream(variantFilename);
      stream.pipe(response);
    } catch (error) {
      // Fallback to original if variant not found
      console.error(`Error streaming variant ${sizeKey}: ${error}`);

      // Only attempt fallback if we haven't written to the response yet
      if (!response.writableEnded) {
        try {
          const originalStream = await this.getFileStream(filename);
          originalStream.pipe(response);
        } catch (finalError) {
          throw new NotFoundError({ message: "File not found" });
        }
      } else {
        throw new NotFoundError({ message: "File not found" });
      }
    }
  }

  /**
   * Check if filename has a size suffix
   * @param filename Filename to check
   * @returns True if filename has a size suffix
   */
  private hasSizeSuffix(filename: string): boolean {
    return (
      filename.includes("-sm") ||
      filename.includes("-md") ||
      filename.includes("-lg") ||
      filename.includes("-xl")
    );
  }

  /**
   * Get appropriate variant filename
   * @param filename Original filename
   * @param sizeKey Size key
   * @returns Variant filename
   */
  private async getVariantFilename(
    filename: string,
    sizeKey: string
  ): Promise<string> {
    const extension = path.extname(filename);
    const baseName = filename.substring(0, filename.lastIndexOf(extension));

    // Try first with the original extension
    let variantFilename = `${baseName}-${sizeKey}${extension}`;

    // If this is not original size and we're using AVIF format, try with AVIF extension
    if (sizeKey !== "original" && this.outputFormat === "avif") {
      try {
        // Check if the file exists with AVIF extension
        if (
          await this.s3Service.checkFileExists(`${baseName}-${sizeKey}.avif`)
        ) {
          variantFilename = `${baseName}-${sizeKey}.avif`;
        }
      } catch (error) {
        // Fallback to original extension if there's an error
        console.warn(
          `Error checking for AVIF variant, using original extension: ${error}`
        );
      }
    }

    return variantFilename;
  }

  /**
   * Stream a dynamically resized image
   *
   * @param filename Filename to resize
   * @param width Target width
   * @param height Target height
   * @param response Express Response object to pipe to
   */
  async streamResizedImage(
    filename: string,
    width: number | undefined,
    height: number | undefined,
    response: Response
  ): Promise<void> {
    try {
      const stream = await this.getFileStream(filename);

      // Create a Sharp transformer with resize options
      const transformer = sharp().resize({
        width,
        height,
        fit: "inside",
        withoutEnlargement: true
      });

      // Add error handlers to the pipeline
      stream.on("error", (err) => {
        console.error(`Error in source stream for ${filename}:`, err);
        if (!response.writableEnded) {
          response.end();
        }
      });

      transformer.on("error", (err) => {
        console.error(`Error in sharp transformer for ${filename}:`, err);
        if (!response.writableEnded) {
          response.end();
        }
      });

      // Pipe through the transformer without setting headers again
      stream.pipe(transformer).pipe(response);
    } catch (error) {
      console.error(`Error setting up resize stream for ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Find the best size variant based on the requested dimensions
   *
   * @param targetWidth Requested width
   * @param targetHeight Requested height
   * @returns Size key of the best matching variant, or "original" if none found
   */
  findBestSizeVariant(targetWidth?: number, targetHeight?: number): string {
    // If no dimensions specified, return original
    if (!targetWidth && !targetHeight) {
      return "original";
    }

    // If only width specified, find the closest matching width
    if (targetWidth && !targetHeight) {
      // Sort sizes from small to large
      const sortedSizes = [...this.imageSizes]
        .filter((size) => size.key !== "original" && size.width !== null)
        .sort((a, b) => (a.width || 0) - (b.width || 0));

      // Find the smallest variant that's at least as large as requested
      for (const size of sortedSizes) {
        if (size.width && size.width >= targetWidth) {
          return size.key;
        }
      }

      // If no variant is large enough, return the largest available
      if (sortedSizes.length > 0) {
        return sortedSizes[sortedSizes.length - 1].key;
      }
    }

    // For now, we don't handle height-only or width+height combinations in a special way
    // Could be improved in the future

    return "original";
  }

  /**
   * Process an image and upload all size variations
   * @param fileBuffer The image buffer
   * @param baseKey The base key for the file
   * @param contentType The content type of the original file
   * @param convertFormat Whether to convert image format to the configured output format
   * @returns Object with URLs for all generated versions
   */
  private async processAndUploadImage(
    fileBuffer: Buffer,
    baseKey: string,
    contentType: string,
    convertFormat = true
  ): Promise<{ [key: string]: string }> {
    const results: { [key: string]: string } = {};

    // Extract file parts
    const { baseFilename, originalExt, avifExtension } =
      this.extractFileParts(baseKey);

    // Process each size in parallel
    await Promise.all(
      this.imageSizes.map(async (size) => {
        try {
          // Process image for this size
          const processed = await this.processImageForSize(
            fileBuffer,
            baseFilename,
            originalExt,
            avifExtension,
            contentType,
            size,
            convertFormat
          );

          // Upload the processed image
          await this.s3Service.uploadBuffer(
            processed.fileKey,
            processed.buffer,
            processed.contentType
          );

          // Store URL in results
          results[size.key] = processed.url;
        } catch (err) {
          console.error(`Error processing size ${size.key}:`, err);
          throw err;
        }
      })
    );

    return results;
  }

  /**
   * Extract base filename and extensions from a key
   * @param baseKey Original file key
   * @returns Object with parts
   */
  private extractFileParts(baseKey: string) {
    const dotIndex = baseKey.lastIndexOf(".");
    const baseFilename =
      dotIndex > -1 ? baseKey.substring(0, dotIndex) : baseKey;
    const originalExt = dotIndex > -1 ? baseKey.substring(dotIndex) : "";
    const avifExtension = `.${this.outputFormat}`;

    return { baseFilename, originalExt, avifExtension };
  }

  /**
   * Process an image for a specific size
   * @param fileBuffer Original file buffer
   * @param baseFilename Base filename without extension
   * @param originalExt Original extension
   * @param avifExtension AVIF extension
   * @param contentType Original content type
   * @param size Size configuration
   * @param convertFormat Whether to convert format
   * @returns Processed image info
   */
  private async processImageForSize(
    fileBuffer: Buffer,
    baseFilename: string,
    originalExt: string,
    avifExtension: string,
    contentType: string,
    size: { key: string; width: number | null },
    convertFormat: boolean
  ): Promise<ProcessedImage> {
    if (size.key === "original") {
      return this.processOriginalImage(
        fileBuffer,
        baseFilename,
        originalExt,
        avifExtension,
        contentType,
        convertFormat
      );
    } else {
      return this.processResizedImage(
        fileBuffer,
        baseFilename,
        originalExt,
        avifExtension,
        contentType,
        size,
        convertFormat
      );
    }
  }

  /**
   * Process the original image
   * @param fileBuffer Original file buffer
   * @param baseFilename Base filename
   * @param originalExt Original extension
   * @param avifExtension AVIF extension
   * @param contentType Original content type
   * @param convertFormat Whether to convert format
   * @returns Processed image info
   */
  private async processOriginalImage(
    fileBuffer: Buffer,
    baseFilename: string,
    originalExt: string,
    avifExtension: string,
    contentType: string,
    convertFormat: boolean
  ): Promise<ProcessedImage> {
    let processedBuffer: Buffer;
    let outputContentType: string;
    let key: string;

    if (convertFormat) {
      // Convert original to the configured format
      const image = sharp(fileBuffer);
      processedBuffer = await image
        .toFormat(this.outputFormat, { quality: this.outputQuality })
        .toBuffer();
      outputContentType = `image/${this.outputFormat}`;
      key = `${baseFilename}${avifExtension}`;
    } else {
      // Keep original as is
      processedBuffer = fileBuffer;
      outputContentType = contentType;
      key = `${baseFilename}${originalExt}`;
    }

    return {
      buffer: processedBuffer,
      contentType: outputContentType,
      fileKey: key,
      url: this.generatePublicUrl(key)
    };
  }

  /**
   * Process a resized image
   * @param fileBuffer Original file buffer
   * @param baseFilename Base filename
   * @param originalExt Original extension
   * @param avifExtension AVIF extension
   * @param contentType Original content type
   * @param size Size configuration
   * @param convertFormat Whether to convert format
   * @returns Processed image info
   */
  private async processResizedImage(
    fileBuffer: Buffer,
    baseFilename: string,
    originalExt: string,
    avifExtension: string,
    contentType: string,
    size: { key: string; width: number | null },
    convertFormat: boolean
  ): Promise<ProcessedImage> {
    let processedBuffer: Buffer;
    let outputContentType: string;
    let key: string;

    // Process image with sharp
    const image = sharp(fileBuffer);

    if (convertFormat) {
      // Create key with correct size suffix and extension for converted format
      key = `${baseFilename}-${size.key}${avifExtension}`;

      // Resize and convert to configured format
      processedBuffer = await image
        .resize(size.width)
        .toFormat(this.outputFormat, { quality: this.outputQuality })
        .toBuffer();

      outputContentType = `image/${this.outputFormat}`;
    } else {
      // Keep original format but resize
      key = `${baseFilename}-${size.key}${originalExt}`;

      // Resize but maintain original format
      processedBuffer = await image.resize(size.width).toBuffer();
      outputContentType = contentType;
    }

    return {
      buffer: processedBuffer,
      contentType: outputContentType,
      fileKey: key,
      url: this.generatePublicUrl(key)
    };
  }

  /**
   * Generate a unique key for a file
   * @param fileName The original file name
   * @param prefix Optional prefix for the file
   * @param preserveOriginalName Whether to preserve the exact original filename (for migration)
   * @returns Unique file key
   */
  private generateUniqueKey(
    fileName: string,
    prefix: string = "",
    preserveOriginalName: boolean = false
  ): string {
    const ext = path.extname(fileName);
    const originalName = path.basename(fileName, ext);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const sanitizedPrefix = prefix ? `${prefix}/` : "";

    if (preserveOriginalName) {
      // Use the exact original filename without any cleaning
      return `${sanitizedPrefix}${originalName}${ext}`;
    }

    return `${sanitizedPrefix}${timestamp}-${randomStr}${ext}`;
  }

  /**
   * Get key for a specific size
   * @param baseKey Base key
   * @param sizeKey Size key
   * @returns Full key for the size
   */
  private getKeyForSize(baseKey: string, sizeKey: string): string {
    return sizeKey === "original" ? baseKey : `${baseKey}-${sizeKey}`;
  }

  /**
   * Get base key without size suffix
   * @param key The full key
   * @returns The base key
   */
  private getBaseKey(key: string): string {
    // Check if the key has a size suffix and remove it
    for (const size of this.imageSizes) {
      if (size.key !== "original" && key.endsWith(`-${size.key}`)) {
        return key.substring(0, key.length - size.key.length - 1);
      }
    }
    return key;
  }

  /**
   * Generate a public URL for a file
   * @param key The file key
   * @returns Public URL
   */
  private generatePublicUrl(key: string): string {
    // Ensure key doesn't start with slash
    const cleanKey = key.startsWith("/") ? key.substring(1) : key;

    // Parse the key to properly encode parts that might contain special characters
    const keyParts = cleanKey.split("/");
    const encodedParts = keyParts.map((part) => encodeURIComponent(part));
    const encodedKey = encodedParts.join("/");

    return `${config.audience}/uploads/${encodedKey}`;
  }

  /**
   * Determine content type based on file extension
   * @param fileName The file name
   * @returns The content type
   */
  public getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const contentTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".avif": "image/avif",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".txt": "text/plain",
      ".csv": "text/csv",
      ".xls": "application/vnd.ms-excel",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".mp3": "audio/mpeg",
      ".mp4": "video/mp4",
      ".zip": "application/zip"
    };

    return contentTypes[ext] || "application/octet-stream";
  }
}

/** Singleton instance of ImageService */
export const imageService = new ImageService();
