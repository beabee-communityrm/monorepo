import sharp from "sharp";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  S3ClientConfig
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import path from "path";
import config from "#config/config";
import { BadRequestError } from "../errors";
import type { Response } from "express";

// Image size configurations
const IMAGE_SIZES = [
  { key: "original", width: null },
  { key: "sm", width: 300 },
  { key: "md", width: 600 },
  { key: "lg", width: 1440 },
  { key: "xl", width: 2560 }
];

// Output format for resized images (AVIF has better compression than WebP)
const OUTPUT_FORMAT = "avif" as const;
// Quality setting for AVIF (0-100)
const OUTPUT_QUALITY = 65;

// Supported image mime types for resizing
const RESIZABLE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml"
];

// Stream options for different file types
interface StreamOptions {
  width?: number | undefined;
  height?: number | undefined;
}

class ImageService {
  private s3Client: S3Client;
  private bucket: string;
  private imageSizes: typeof IMAGE_SIZES;
  private outputFormat: typeof OUTPUT_FORMAT;
  private outputQuality: number;

  constructor() {
    // Configure S3 client for MinIO
    const s3Config: S3ClientConfig = {
      endpoint: config.minio.endpoint,
      region: config.minio.region || "us-east-1",
      credentials: {
        accessKeyId: config.minio.accessKey,
        secretAccessKey: config.minio.secretKey
      },
      forcePathStyle: true // Required for MinIO
    };

    this.s3Client = new S3Client(s3Config);
    this.bucket = config.minio.bucket;
    this.imageSizes = IMAGE_SIZES;
    this.outputFormat = OUTPUT_FORMAT;
    this.outputQuality = OUTPUT_QUALITY;
  }

  /**
   * Upload a file to MinIO and process image variations if it's an image
   * @param fileBuffer The file buffer to upload
   * @param fileName Original filename (used to determine content type)
   * @param prefix Optional folder prefix for the file
   * @returns Object with URLs for all generated versions
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    prefix = ""
  ): Promise<{ [key: string]: string }> {
    try {
      // Generate a unique key for the file
      const fileKey = this.generateUniqueKey(fileName, prefix);
      const contentType = this.getContentType(fileName);

      // Check if this is an image that needs processing
      const isResizableImage = RESIZABLE_MIME_TYPES.includes(contentType);

      if (isResizableImage) {
        return await this.processAndUploadImage(
          fileBuffer,
          fileKey,
          contentType
        );
      } else {
        // For non-image files, just upload the original
        await this.uploadToS3(fileKey, fileBuffer, contentType);

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
          const key =
            size.key === "original" ? baseKey : `${baseKey}-${size.key}`;

          try {
            await this.s3Client.send(
              new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key
              })
            );
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
  async getFileStream(fileKey: string): Promise<Readable> {
    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: fileKey
        })
      );

      return response.Body as Readable;
    } catch (error) {
      console.error("Error getting file stream:", error);
      throw new BadRequestError({ message: "Failed to get file" });
    }
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
      const contentType = this.getContentType(filename);
      const isResizableImage = RESIZABLE_MIME_TYPES.includes(contentType);

      // For non-image files or when no resize options are provided, stream directly
      if (!isResizableImage || (!options.width && !options.height)) {
        const stream = await this.getFileStream(filename);
        stream.pipe(response);
        return;
      }

      // For images with resize options, try to find the best variant or resize dynamically
      const targetWidth = options.width;
      const targetHeight = options.height;

      // Try to find an existing variant that matches or is close to the requested size
      const bestVariant = this.findBestSizeVariant(targetWidth, targetHeight);
      if (bestVariant && bestVariant !== "original") {
        try {
          await this.streamVariant(filename, bestVariant, response);
          return;
        } catch (err) {
          // If variant not found, fall back to dynamic resizing
          console.warn(
            `Variant ${bestVariant} not found, using dynamic resizing`
          );
        }
      }

      // Dynamic resizing
      await this.streamResizedImage(
        filename,
        targetWidth,
        targetHeight,
        response
      );
    } catch (error) {
      console.error("Error streaming file:", error);
      throw new BadRequestError({ message: "Failed to stream file" });
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
    // Check if the filename already contains a size suffix
    if (
      filename.includes("-sm") ||
      filename.includes("-md") ||
      filename.includes("-lg") ||
      filename.includes("-xl")
    ) {
      // If it does, use it as is
      const stream = await this.getFileStream(filename);
      stream.pipe(response);
      return;
    }

    // Otherwise, construct the variant filename
    const extension = filename.substring(filename.lastIndexOf(".") || 0);
    const baseName = filename.substring(
      0,
      filename.lastIndexOf(".") || filename.length
    );
    const variantFilename = `${baseName}-${sizeKey}${extension}`;

    // Get and stream the variant
    const stream = await this.getFileStream(variantFilename);
    stream.pipe(response);
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
    const stream = await this.getFileStream(filename);

    // Create a Sharp transformer with resize options
    const transformer = sharp().resize({
      width,
      height,
      fit: "inside",
      withoutEnlargement: true
    });

    // Pipe through the transformer
    stream.pipe(transformer).pipe(response);
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
   * @returns Object with URLs for all generated versions
   */
  private async processAndUploadImage(
    fileBuffer: Buffer,
    baseKey: string,
    contentType: string
  ): Promise<{ [key: string]: string }> {
    const results: { [key: string]: string } = {};

    // Process each size in parallel
    await Promise.all(
      this.imageSizes.map(async (size) => {
        try {
          let processedBuffer: Buffer;
          let outputContentType: string;
          const key =
            size.key === "original" ? baseKey : `${baseKey}-${size.key}`;

          if (size.key === "original") {
            // Keep original as is
            processedBuffer = fileBuffer;
            outputContentType = contentType;
          } else {
            // Process image with sharp
            const image = sharp(fileBuffer);

            // Resize and convert to AVIF for best compression/quality ratio
            processedBuffer = await image
              .resize(size.width)
              .toFormat(this.outputFormat, { quality: this.outputQuality })
              .toBuffer();

            outputContentType = `image/${this.outputFormat}`;
          }

          // Upload the processed image
          await this.uploadToS3(key, processedBuffer, outputContentType);

          // Generate public URL
          results[size.key] = this.generatePublicUrl(key);
        } catch (err) {
          console.error(`Error processing size ${size.key}:`, err);
          throw err;
        }
      })
    );

    return results;
  }

  /**
   * Upload a buffer to S3/MinIO
   * @param key The object key
   * @param buffer The buffer to upload
   * @param contentType The content type
   */
  private async uploadToS3(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType
      })
    );
  }

  /**
   * Generate a unique key for a file
   * @param fileName The original file name
   * @param prefix Optional prefix for the file
   * @returns Unique file key
   */
  private generateUniqueKey(fileName: string, prefix: string): string {
    const ext = path.extname(fileName);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const sanitizedPrefix = prefix ? `${prefix}/` : "";

    return `${sanitizedPrefix}${timestamp}-${randomStr}${ext}`;
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
    return `${config.audience}/uploads/${cleanKey}`;
  }

  /**
   * Determine content type based on file extension
   * @param fileName The file name
   * @returns The content type
   */
  private getContentType(fileName: string): string {
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

export const imageService = new ImageService();
export default imageService;
