import { randomUUID } from "crypto";
import { Readable } from "stream";
import { extname } from "path";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import {
  isSupportedImageType,
  ALLOWED_IMAGE_INPUT_FORMATS
} from "@beabee/beabee-common";

import type { ImageFormat } from "../type/image-format";
import type { ImageServiceConfig } from "../type/image-service-config";
import type { ImageMetadata } from "../type/image-metadata";
import { BadRequestError, NotFoundError } from "../errors";
import { log as mainLogger } from "../logging";
import { getMimetypeFromExtension } from "../utils/file";
import {
  checkConnection,
  fileExists,
  getFileStream,
  getFileBuffer
} from "../utils/s3";

const log = mainLogger.child({ app: "image-service" });

/**
 * Service for handling image uploads, resizing, and storage in S3/MinIO
 */
export class ImageService {
  private readonly s3Client: S3Client;
  private readonly config: ImageServiceConfig;
  private readonly defaultConfig: Partial<ImageServiceConfig> = {
    quality: 80,
    format: "avif",
    availableWidths: [100, 300, 400, 600, 900, 1200, 1440, 1800]
  };

  /**
   * Create a new ImageService
   * @param config Service configuration
   */
  constructor(config: ImageServiceConfig) {
    this.config = { ...this.defaultConfig, ...config };

    this.s3Client = new S3Client({
      endpoint: this.config.s3.endpoint,
      region: this.config.s3.region,
      credentials: {
        accessKeyId: this.config.s3.accessKey,
        secretAccessKey: this.config.s3.secretKey
      },
      forcePathStyle: this.config.s3.forcePathStyle !== false
    });
  }

  /**
   * Sanitize filename to prevent path traversal attacks
   * @param filename Original filename
   * @returns Sanitized filename
   */
  private sanitizeFilename(filename: string): string {
    // Remove path components and special characters
    return filename.replace(/[/\\?%*:|"<>]/g, "_").replace(/^\.+/, "");
  }

  /**
   * Validate image file type, size and content
   * @param imageData Image data buffer
   * @param mimetype MIME type if known
   */
  private async validateImage(
    imageData: Buffer,
    mimetype?: string
  ): Promise<void> {
    // Validate MIME type if provided
    if (mimetype && !isSupportedImageType(mimetype)) {
      throw new BadRequestError({
        message:
          "Unsupported image type. Please upload a JPEG, PNG, WebP or AVIF image."
      });
    }

    try {
      // Validate image content with sharp
      const image = sharp(imageData);
      const metadata = await image.metadata();

      // Check if it's actually a valid image
      if (!metadata.width || !metadata.height || !metadata.format) {
        throw new BadRequestError({ message: "Invalid image format" });
      }

      // Check if the detected format is allowed
      if (!isSupportedImageType(getMimetypeFromExtension(metadata.format))) {
        throw new BadRequestError({
          message:
            "Unsupported image format. Please upload a JPEG, PNG, WebP or AVIF image."
        });
      }
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError({ message: "Invalid image file" });
    }
  }

  /**
   * Upload an image to S3/MinIO
   * @param imageData Binary image data or file stream
   * @param originalFilename Original filename (optional)
   * @param owner Owner's contact email (optional)
   * @param format Output format (avif, webp, jpeg, png, or "original" to keep the original format)
   * @returns Metadata for the uploaded image
   */
  async uploadImage(
    imageData: Buffer,
    originalFilename?: string,
    owner?: string,
    format?: ImageFormat
  ): Promise<ImageMetadata> {
    try {
      // If imageData is a ReadStream, convert it to a Buffer
      if (!Buffer.isBuffer(imageData)) {
        throw new BadRequestError({ message: "Invalid upload format" });
      }

      // Validate image content, size and type
      await this.validateImage(
        imageData,
        originalFilename
          ? getMimetypeFromExtension(originalFilename)
          : undefined
      );

      // Sanitize original filename if provided
      const sanitizedFilename = originalFilename
        ? this.sanitizeFilename(originalFilename)
        : undefined;

      // Process the image with sharp to get metadata
      const image = sharp(imageData).rotate(); // Auto-rotate based on EXIF orientation
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height || !metadata.format) {
        throw new BadRequestError({ message: "Invalid image format" });
      }

      // Generate a unique ID for the image
      const fileId = randomUUID();

      // Target format based on parameter or configuration
      const outputFormat = format || this.config.format || "avif";

      // File extension based on the output format or original format
      let extension: string;
      if (outputFormat === "original") {
        extension = metadata.format;
      } else {
        extension = outputFormat;
      }

      const id = `${fileId}.${extension}`;

      // Process the image to the target format, but keep full resolution
      let processedImageBuffer: Buffer;

      // Convert the image to the target format or keep original
      if (outputFormat === "original") {
        // Keep the original format but strip metadata
        processedImageBuffer = await image
          .withMetadata({ orientation: undefined }) // Strip EXIF but keep orientation
          .toBuffer();
      } else {
        // Convert to the specified format
        switch (outputFormat) {
          case "webp":
            processedImageBuffer = await image
              .withMetadata({ orientation: undefined })
              .webp({ quality: this.config.quality })
              .toBuffer();
            break;
          case "avif":
            processedImageBuffer = await image
              .withMetadata({ orientation: undefined })
              .avif({ quality: this.config.quality })
              .toBuffer();
            break;
          case "jpeg":
            processedImageBuffer = await image
              .withMetadata({ orientation: undefined })
              .jpeg({ quality: this.config.quality })
              .toBuffer();
            break;
          case "png":
            processedImageBuffer = await image
              .withMetadata({ orientation: undefined })
              .png({
                quality: this.config.quality
                  ? Math.floor(this.config.quality / 10)
                  : 8
              })
              .toBuffer();
            break;
          default:
            processedImageBuffer = await image
              .withMetadata({ orientation: undefined })
              .toBuffer();
        }
      }

      // Correct MIME type for the output format
      const outputMimetype =
        outputFormat === "original"
          ? getMimetypeFromExtension(metadata.format)
          : getMimetypeFromExtension(extension);

      // Prepare metadata for S3
      const s3Metadata: Record<string, string> = {};
      if (sanitizedFilename) {
        s3Metadata.originalFilename = sanitizedFilename;
      }
      if (owner) {
        s3Metadata.owner = owner;
      }

      // Upload the processed original image
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.config.s3.bucket,
          Key: `originals/${id}`,
          Body: processedImageBuffer,
          ContentType: outputMimetype,
          Metadata: Object.keys(s3Metadata).length > 0 ? s3Metadata : undefined
        })
      );

      // Return metadata
      return {
        id,
        width: metadata.width,
        height: metadata.height,
        mimetype: outputMimetype,
        createdAt: new Date(),
        size: processedImageBuffer.length,
        filename: sanitizedFilename,
        owner
      };
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      log.error("Failed to upload image:", error);
      throw new BadRequestError({ message: "Failed to upload image" });
    }
  }

  /**
   * Get an image stream with the specified width
   * @param id Image ID
   * @param width Desired width in pixels (optional)
   * @returns Stream of the image and content type
   */
  async getImageStream(
    id: string,
    width?: number
  ): Promise<{ stream: Readable; contentType: string }> {
    try {
      // Check if image exists
      await this.imageExists(id);

      // Determine the best width to use
      let bestWidth: number | undefined = undefined;

      if (width) {
        // Find the closest available width that is >= the requested width
        const availableWidths = [...this.config.availableWidths].sort(
          (a, b) => a - b
        );
        bestWidth =
          availableWidths.find((w) => w >= width) ||
          availableWidths[availableWidths.length - 1];
      }

      // Determine the key to use based on whether we're getting a resized version
      const key = bestWidth ? `resized/${bestWidth}/${id}` : `originals/${id}`;

      // Check if the resized version exists
      const resizedExists = await fileExists(
        this.s3Client,
        this.config.s3.bucket,
        key
      );

      // If the resized version doesn't exist and bestWidth is set, generate it
      if (!resizedExists && bestWidth) {
        try {
          await this.generateResizedImage(id, bestWidth);
        } catch (error) {
          log.error(
            `Failed to generate resized image (${id}, ${bestWidth})`,
            error
          );
          // Fall back to the original image
          bestWidth = undefined;
        }
      }

      // Recalculate the key if we had to fall back
      const finalKey = bestWidth
        ? `resized/${bestWidth}/${id}`
        : `originals/${id}`;

      try {
        return await getFileStream(
          this.s3Client,
          this.config.s3.bucket,
          finalKey
        );
      } catch (error) {
        log.error(`Failed to get image (${id})`, error);
        throw new NotFoundError();
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      log.error("Failed to get image stream:", error);
      throw new BadRequestError({ message: "Failed to get image stream" });
    }
  }

  /**
   * Get an image as a buffer with the specified width
   * @param id Image ID
   * @param width Desired width in pixels (optional)
   * @returns Buffer of the image and content type
   */
  async getImageBuffer(
    id: string,
    width?: number
  ): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      const { stream, contentType } = await this.getImageStream(id, width);

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      const buffer = Buffer.concat(chunks);

      return { buffer, contentType };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      log.error("Failed to get image buffer:", error);
      throw new BadRequestError({ message: "Failed to get image buffer" });
    }
  }

  /**
   * Delete an image and all its resized versions
   * @param id Image ID
   * @returns True if deleted successfully
   */
  async deleteImage(id: string): Promise<boolean> {
    try {
      // Check if image exists
      await this.imageExists(id);

      // Delete the original image
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.config.s3.bucket,
          Key: `originals/${id}`
        })
      );

      // List and delete all resized versions
      const listCommand = new ListObjectsV2Command({
        Bucket: this.config.s3.bucket,
        Prefix: `resized/`
      });

      const response = await this.s3Client.send(listCommand);

      if (response.Contents) {
        const deletePromises = response.Contents.filter(
          (item) => item.Key && item.Key.endsWith(`/${id}`)
        ).map((item) => {
          return this.s3Client.send(
            new DeleteObjectCommand({
              Bucket: this.config.s3.bucket,
              Key: item.Key
            })
          );
        });

        await Promise.all(deletePromises);
      }

      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      log.error("Failed to delete image:", error);
      throw new BadRequestError({ message: "Failed to delete image" });
    }
  }

  /**
   * Check if an image exists
   * @param id Image ID
   * @returns True if the image exists
   */
  async imageExists(id: string): Promise<boolean> {
    return fileExists(this.s3Client, this.config.s3.bucket, `originals/${id}`);
  }

  /**
   * Get metadata for an image
   * @param id Image ID
   * @returns Image metadata
   */
  async getImageMetadata(id: string): Promise<ImageMetadata> {
    try {
      // Check if the image exists
      if (!(await this.imageExists(id))) {
        throw new NotFoundError();
      }

      // Get the original image to extract width and height
      const { buffer, contentType } = await getFileBuffer(
        this.s3Client,
        this.config.s3.bucket,
        `originals/${id}`
      );

      // Get image dimensions using sharp
      const metadata = await sharp(buffer).metadata();

      if (!metadata.width || !metadata.height) {
        throw new BadRequestError({ message: "Invalid image format" });
      }

      // Get file metadata
      const response = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.config.s3.bucket,
          Key: `originals/${id}`
        })
      );

      const s3Metadata = response.Metadata || {};

      return {
        id,
        width: metadata.width,
        height: metadata.height,
        mimetype: contentType,
        createdAt: response.LastModified || new Date(),
        size: response.ContentLength || buffer.length,
        filename: s3Metadata.originalfilename,
        owner: s3Metadata.owner
      };
    } catch (error) {
      log.error("Failed to get image metadata:", error);
      throw new NotFoundError();
    }
  }

  /**
   * Check connection to S3/MinIO
   * @returns True if connection is successful
   */
  async checkConnection(): Promise<boolean> {
    return checkConnection(this.s3Client, this.config.s3.bucket);
  }

  /**
   * List all images
   * @returns Array of image paths
   */
  async listImages(): Promise<string[]> {
    try {
      const response = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.config.s3.bucket,
          Prefix: "originals/"
        })
      );

      return (response.Contents || [])
        .map((item) => item.Key || "")
        .filter((key) => key.startsWith("originals/"));
    } catch (error) {
      log.error("Failed to list images:", error);
      return [];
    }
  }

  /**
   * Generate a resized version of an image
   * @param id Image ID
   * @param width Width to resize to
   * @private
   */
  private async generateResizedImage(id: string, width: number): Promise<void> {
    try {
      // Get the original image
      const { buffer, contentType } = await getFileBuffer(
        this.s3Client,
        this.config.s3.bucket,
        `originals/${id}`
      );

      // Resize the image
      const extension = extname(id).substring(1);
      const format = this.config.format || extension;

      // Use sharp to resize the image
      let resizedImageBuffer: Buffer;

      const sharpInstance = sharp(buffer).resize({
        width,
        withoutEnlargement: true
      });

      // Set format and quality
      if (format === "original") {
        // Keep the original format (extension from the file)
        resizedImageBuffer = await sharpInstance.toBuffer();
      } else {
        switch (format) {
          case "webp":
            resizedImageBuffer = await sharpInstance
              .webp({ quality: this.config.quality })
              .toBuffer();
            break;
          case "avif":
            resizedImageBuffer = await sharpInstance
              .avif({ quality: this.config.quality })
              .toBuffer();
            break;
          case "jpeg":
            resizedImageBuffer = await sharpInstance
              .jpeg({ quality: this.config.quality })
              .toBuffer();
            break;
          case "png":
            resizedImageBuffer = await sharpInstance
              .png({
                quality: this.config.quality
                  ? Math.floor(this.config.quality / 10)
                  : 8
              })
              .toBuffer();
            break;
          default:
            resizedImageBuffer = await sharpInstance.toBuffer();
        }
      }

      // Upload the resized image
      const outputContentType =
        format === "original" ? contentType : getMimetypeFromExtension(format);

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.config.s3.bucket,
          Key: `resized/${width}/${id}`,
          Body: resizedImageBuffer,
          ContentType: outputContentType
        })
      );
    } catch (error) {
      log.error("Failed to generate resized image:", error);
      throw new BadRequestError({
        message: "Failed to generate resized image"
      });
    }
  }
}

export const imageService = new ImageService({
  availableWidths: [100, 300, 600, 900, 1200, 1800],
  s3: {
    endpoint: process.env.MINIO_ENDPOINT || "http://minio:9000",
    region: process.env.MINIO_REGION || "us-east-1",
    accessKey: process.env.MINIO_ROOT_USER || "minioadmin",
    secretKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin",
    bucket: process.env.MINIO_BUCKET || "uploads",
    forcePathStyle: true
  },
  quality: parseInt(process.env.IMAGE_QUALITY || "80"),
  format: (process.env.IMAGE_FORMAT || "avif") as ImageFormat
});
