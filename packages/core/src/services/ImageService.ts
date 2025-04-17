import { randomUUID } from "crypto";
import { Readable } from "stream";
import { extname } from "path";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import sharp from "sharp";

import type { ImageFormat, ImageServiceConfig, ImageMetadata } from "../type";
import { BadRequestError, NotFoundError } from "../errors";
import { log as mainLogger } from "../logging";
import { getMimetypeFromExtension } from "../utils/file";

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
    availableWidths: [100, 300, 600, 900, 1200, 1800]
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
   * Upload an image to S3/MinIO
   * @param imageData Binary image data or file stream
   * @param format Output format (avif, webp, jpeg, png, or "original" to keep the original format)
   * @returns Metadata for the uploaded image
   */
  async uploadImage(
    imageData: Buffer,
    format?: ImageFormat
  ): Promise<ImageMetadata> {
    try {
      // If imageData is a ReadStream, convert it to a Buffer
      if (!Buffer.isBuffer(imageData)) {
        throw new BadRequestError({ message: "Invalid image format" });
      }

      // Process the image with sharp to get metadata
      const image = sharp(imageData);
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
        // Keep the original format
        processedImageBuffer = await image.toBuffer();
      } else {
        // Convert to the specified format
        switch (outputFormat) {
          case "webp":
            processedImageBuffer = await image
              .webp({ quality: this.config.quality })
              .toBuffer();
            break;
          case "avif":
            processedImageBuffer = await image
              .avif({ quality: this.config.quality })
              .toBuffer();
            break;
          case "jpeg":
            processedImageBuffer = await image
              .jpeg({ quality: this.config.quality })
              .toBuffer();
            break;
          case "png":
            processedImageBuffer = await image
              .png({
                quality: this.config.quality
                  ? Math.floor(this.config.quality / 10)
                  : 8
              })
              .toBuffer();
            break;
          default:
            processedImageBuffer = await image.toBuffer();
        }
      }

      // Correct MIME type for the output format
      const outputMimetype =
        outputFormat === "original"
          ? getMimetypeFromExtension(metadata.format)
          : getMimetypeFromExtension(extension);

      // Upload the processed original image
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.config.s3.bucket,
          Key: `originals/${id}`,
          Body: processedImageBuffer,
          ContentType: outputMimetype
        })
      );

      // Return metadata
      return {
        id,
        width: metadata.width,
        height: metadata.height,
        mimetype: outputMimetype,
        createdAt: new Date(),
        size: processedImageBuffer.length
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
      await this.getImageMetadata(id);

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
      let resizedExists = false;
      try {
        await this.s3Client.send(
          new HeadObjectCommand({
            Bucket: this.config.s3.bucket,
            Key: key
          })
        );
        resizedExists = true;
      } catch (error) {
        resizedExists = false;
      }

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
        // Get the content type from metadata
        const headResult = await this.s3Client.send(
          new HeadObjectCommand({
            Bucket: this.config.s3.bucket,
            Key: finalKey
          })
        );

        const contentType =
          headResult.ContentType || "application/octet-stream";

        // Get the object as a stream
        const { Body } = await this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.config.s3.bucket,
            Key: finalKey
          })
        );

        if (!Body) {
          throw new NotFoundError();
        }

        return {
          stream: Body as Readable,
          contentType
        };
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

  async getImageBuffer(
    id: string,
    width?: number
  ): Promise<{ buffer: Buffer; contentType: string }> {
    const { stream, contentType } = await this.getImageStream(id, width);

    // Stream zu Buffer konvertieren
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    return { buffer, contentType };
  }

  /**
   * Delete an image and all its resized versions
   * @param id Image ID
   * @returns True if deleted successfully
   */
  async deleteImage(id: string): Promise<boolean> {
    try {
      // Check if image exists
      await this.getImageMetadata(id);

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
   * Get metadata for an image
   * @param id Image ID
   * @returns Image metadata
   */
  async getImageMetadata(id: string): Promise<ImageMetadata> {
    try {
      const response = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.config.s3.bucket,
          Key: `originals/${id}`
        })
      );

      // Get the original image to extract width and height
      const getObjectCommand = new GetObjectCommand({
        Bucket: this.config.s3.bucket,
        Key: `originals/${id}`
      });

      const { Body, ContentLength, ContentType, LastModified } =
        await this.s3Client.send(getObjectCommand);

      if (!Body || !ContentType || !LastModified) {
        throw new NotFoundError();
      }

      // Read the stream into a buffer
      const chunks: Buffer[] = [];
      // @ts-ignore - Body is a stream
      for await (const chunk of Body) {
        chunks.push(Buffer.from(chunk));
      }
      const imageBuffer = Buffer.concat(chunks);

      // Get image dimensions using sharp
      const metadata = await sharp(imageBuffer).metadata();

      if (!metadata.width || !metadata.height) {
        throw new BadRequestError({ message: "Invalid image format" });
      }

      return {
        id,
        width: metadata.width,
        height: metadata.height,
        mimetype: ContentType,
        createdAt: LastModified,
        size: ContentLength || 0
      };
    } catch (error) {
      log.error("Failed to get image metadata:", error);
      throw new NotFoundError();
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.config.s3.bucket,
          MaxKeys: 1
        })
      );
      return true;
    } catch (error) {
      log.error("MinIO connection check failed:", error);
      return false;
    }
  }

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
      const getObjectCommand = new GetObjectCommand({
        Bucket: this.config.s3.bucket,
        Key: `originals/${id}`
      });

      const { Body, ContentType } = await this.s3Client.send(getObjectCommand);

      if (!Body || !ContentType) {
        throw new NotFoundError();
      }

      // Read the stream into a buffer
      const chunks: Buffer[] = [];
      // @ts-ignore - Body is a stream
      for await (const chunk of Body) {
        chunks.push(Buffer.from(chunk));
      }
      const imageBuffer = Buffer.concat(chunks);

      // Resize the image
      const extension = extname(id).substring(1);
      const format = this.config.format || extension;

      // Use sharp to resize the image
      let resizedImageBuffer: Buffer;

      const sharpInstance = sharp(imageBuffer).resize({
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
        format === "original" ? ContentType : getMimetypeFromExtension(format);

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
