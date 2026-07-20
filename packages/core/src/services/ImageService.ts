import {
  ALLOWED_IMAGE_MIME_TYPES,
  ApiHealthStatus,
  S3Metadata,
  isSupportedImageType,
} from '@beabee/beabee-common';

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { HttpError } from 'routing-controllers';
import sharp from 'sharp';
import { Readable } from 'stream';
import { buffer } from 'stream/consumers';
import { pipeline } from 'stream/promises';
import { optimize } from 'svgo';

import config from '../config/config.js';
import {
  BadRequestError,
  NotFoundError,
  UnsupportedFileTypeError,
} from '../errors/index.js';
import { log as mainLogger } from '../logging.js';
import type {
  ImageBackfillResult,
  ImageFormat,
  ImageMetadata,
  ImageServiceConfig,
} from '../type/index.js';
import {
  getExtensionFromFilename,
  getMimetypeFromDecoderFormat,
  getMimetypeFromExtension,
  getOrientedDimensions,
  sanitizeFilename,
} from '../utils/file.js';
import {
  checkConnection,
  fileExists,
  getFileBuffer,
  getFileHash,
  getFileStream,
  putFileStream,
} from '../utils/s3.js';

const log = mainLogger.child({ app: 'image-service' });

/**
 * Service for handling image uploads, resizing, and storage in S3/MinIO
 */
export class ImageService {
  private readonly s3Client: S3Client;
  /**
   * Create a new ImageService
   * @param config Service configuration
   */
  constructor(private readonly config: ImageServiceConfig) {
    this.s3Client = new S3Client({
      endpoint: this.config.s3.endpoint,
      region: this.config.s3.region,
      credentials: {
        accessKeyId: this.config.s3.accessKey,
        secretAccessKey: this.config.s3.secretKey,
      },
      forcePathStyle: this.config.s3.forcePathStyle !== false,
    });

    this.config.availableWidths = [...this.config.availableWidths].sort(
      (a, b) => a - b
    );
  }

  /**
   * Upload an image to S3/MinIO
   * @param imageData Image data as a stream or buffer
   * @param originalFilename Original filename
   * @param owner Owner's contact email (optional)
   * @param format Output format (avif, webp, jpeg, png, or "original" to keep the original format)
   * @returns Metadata for the uploaded image
   */
  async uploadImage(
    imageData: Readable | Buffer,
    originalFilename: string,
    owner?: string,
    format?: ImageFormat
  ): Promise<ImageMetadata> {
    try {
      const stream = Buffer.isBuffer(imageData)
        ? Readable.from(imageData)
        : imageData;

      const sanitizedFilename = sanitizeFilename(originalFilename);
      const originalExtension = getExtensionFromFilename(originalFilename);
      const originalMimetype = getMimetypeFromExtension(originalExtension);

      // Validate MIME type before consuming the stream
      if (originalMimetype && !isSupportedImageType(originalMimetype)) {
        throw new UnsupportedFileTypeError(
          originalMimetype,
          ALLOWED_IMAGE_MIME_TYPES
        );
      }

      // SVGs are buffered in full as SVGO needs the whole content
      const isSvg = originalMimetype === 'image/svg+xml';

      let image: sharp.Sharp;
      let svgBuffer: Buffer | undefined;

      if (isSvg) {
        svgBuffer = await buffer(stream);
        image = sharp(svgBuffer);
      } else {
        image = sharp();
        // Sharp buffers the whole input internally and only processes it once
        // the stream ends, so wait for the input to finish before probing the
        // metadata (otherwise a failed stream would hang forever). Stream
        // errors (e.g. FileTooLargeError) propagate from here.
        await pipeline(stream, image);
      }

      let metadata: sharp.Metadata;
      try {
        metadata = await image.metadata();
      } catch {
        throw new BadRequestError('Invalid image file');
      }

      // Check if it's actually a valid image
      if (!metadata.width || !metadata.height || !metadata.format) {
        throw new BadRequestError('Invalid image format');
      }

      // Check if the detected format is allowed
      if (
        !isSupportedImageType(getMimetypeFromDecoderFormat(metadata.format))
      ) {
        throw new UnsupportedFileTypeError(
          getMimetypeFromDecoderFormat(metadata.format),
          ALLOWED_IMAGE_MIME_TYPES
        );
      }

      // The raw bytes can't be recovered from a stream-fed sharp instance, so
      // SVG content must be uploaded with an SVG extension
      if (metadata.format === 'svg' && !isSvg) {
        throw new BadRequestError('SVG uploads must use a .svg file extension');
      }

      // If the image format is already the target format or a vector graphic,
      // we keep the original format if no other format is forced
      if (metadata.format === this.config.format) {
        format ||= 'original';
      }

      // We keep SVGs as SVGs by default
      if (metadata.format === 'svg') {
        format ||= 'original';
      }

      // Generate a unique ID for the image
      const fileId = randomUUID();

      // Target format based on parameter or configuration
      const outputFormat = format || this.config.format || 'avif';

      // File extension based on the output format or original format
      let extension: string;
      if (outputFormat === 'original') {
        extension = '.' + metadata.format;
        if (originalExtension !== extension) {
          log.warning(
            `Original image extension (${originalExtension}) does not match detected format (${metadata.format}).`
          );
        }
      } else {
        extension = '.' + outputFormat;
      }

      const id = `${fileId}${extension}`;

      // Correct MIME type for the output format
      const outputMimetype =
        outputFormat === 'original'
          ? getMimetypeFromExtension(metadata.format)
          : getMimetypeFromExtension(extension);

      // `.rotate()` below auto-orients the image based on EXIF, so the
      // stored dimensions must account for that rotation upfront
      const orientedDimensions = getOrientedDimensions(
        metadata.width,
        metadata.height,
        metadata.orientation
      );

      // Prepare metadata for S3, storing the dimensions so they can be read
      // later without downloading the image
      const s3Metadata: S3Metadata = {
        width: String(orientedDimensions.width),
        height: String(orientedDimensions.height),
      };
      if (sanitizedFilename) {
        s3Metadata.originalfilename = sanitizedFilename;
      }
      if (owner) {
        s3Metadata.owner = owner;
      }

      // Handle SVG optimization
      if (svgBuffer && outputFormat === 'original') {
        // Optimize SVG using SVGO
        const result = optimize(svgBuffer.toString('utf8'), {
          multipass: true,
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  // Disable removeViewBox to preserve the original aspect ratio
                  removeViewBox: false,
                },
              },
            },
          ],
        });

        // Upload the optimized SVG
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.config.s3.bucket,
            Key: `originals/${id}`,
            Body: Buffer.from(result.data, 'utf8'),
            ContentType: outputMimetype,
            Metadata: s3Metadata as Record<string, string>,
          })
        );
      } else {
        // Process the image to the target format at full resolution and
        // stream the result to S3
        image.rotate().withMetadata({ orientation: undefined }); // Strip EXIF but keep orientation
        switch (outputFormat) {
          case 'webp':
            image.webp({ quality: this.config.quality });
            break;
          case 'avif':
            image.avif({ quality: this.config.quality });
            break;
          case 'jpeg':
            image.jpeg({ quality: this.config.quality });
            break;
          case 'png':
            image.png({
              quality: this.config.quality
                ? Math.floor(this.config.quality / 10)
                : 8,
            });
            break;
          // 'original' keeps the input format
        }

        await putFileStream(
          this.s3Client,
          this.config.s3.bucket,
          `originals/${id}`,
          image,
          outputMimetype,
          s3Metadata as Record<string, string>
        );
      }

      // Size, hash, createdAt etc. come from a single HeadObject request
      return await this.getImageMetadata(id);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      const errorMessage = `Failed to upload image (${originalFilename})`;
      log.error(errorMessage, error);
      throw new BadRequestError(errorMessage);
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
      // Get image metadata to check format, throws NotFoundError if the
      // image doesn't exist
      const metadata = await this.getImageMetadata(id);
      const isSvg = metadata.mimetype === 'image/svg+xml';

      // SVGs should not be scaled - always return original
      if (isSvg) {
        const key = `originals/${id}`;
        try {
          return await getFileStream(this.s3Client, this.config.s3.bucket, key);
        } catch (error) {
          if (error instanceof HttpError) {
            // Don't log HttpError like NotFoundError as error since it's expected behavior
            throw error;
          }
          const errorMessage = `Failed to get SVG image (${id})`;
          log.error(errorMessage, error);
          throw new BadRequestError(errorMessage);
        }
      }

      // Determine the best width to use
      let bestWidth: number | undefined = undefined;

      if (width) {
        // Find the closest available width that is >= the requested width
        bestWidth =
          this.config.availableWidths.find((w) => w >= width) ||
          this.config.availableWidths[this.config.availableWidths.length - 1];
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
        if (error instanceof HttpError) {
          // Don't log HttpError like NotFoundError as error since it's expected behavior
          throw error;
        }
        throw new BadRequestError(`Failed to get image stream (${id})`);
      }
    } catch (error) {
      if (error instanceof HttpError) {
        // Don't log HttpError like NotFoundError as error since it's expected behavior
        throw error;
      }
      const errorMessage = `Failed to get image stream (${id})`;
      log.error(errorMessage, error);
      throw new BadRequestError(errorMessage);
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
      if (error instanceof HttpError) {
        // Don't log HttpError like NotFoundError as error since it's expected behavior
        throw error;
      }
      log.error('Failed to get image buffer:', error);
      throw new BadRequestError('Failed to get image buffer');
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
          Key: `originals/${id}`,
        })
      );

      // List and delete all resized versions
      const listCommand = new ListObjectsV2Command({
        Bucket: this.config.s3.bucket,
        Prefix: `resized/`,
      });

      const response = await this.s3Client.send(listCommand);

      if (response.Contents) {
        const deletePromises = response.Contents.filter(
          (item) => item.Key && item.Key.endsWith(`/${id}`)
        ).map((item) => {
          return this.s3Client.send(
            new DeleteObjectCommand({
              Bucket: this.config.s3.bucket,
              Key: item.Key,
            })
          );
        });

        await Promise.all(deletePromises);
      }

      return true;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      const errorMessage = `Failed to delete image (${id})`;
      log.error(errorMessage, error);
      throw new BadRequestError(errorMessage);
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
      const response = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.config.s3.bucket,
          Key: `originals/${id}`,
        })
      );

      const s3Metadata: S3Metadata = response.Metadata || {};

      return {
        id,
        // Images uploaded before dimensions were stored in the S3 metadata
        // fall back to 0
        width: s3Metadata.width ? parseInt(s3Metadata.width, 10) : 0,
        height: s3Metadata.height ? parseInt(s3Metadata.height, 10) : 0,
        mimetype: response.ContentType || 'application/octet-stream',
        createdAt: response.LastModified || new Date(),
        size: response.ContentLength || 0,
        filename: s3Metadata.originalfilename,
        owner: s3Metadata.owner,
        hash: response.ETag ? response.ETag.replace(/"/g, '') : '',
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new NotFoundError();
    }
  }

  /**
   * Get the hash (ETag) of an image without downloading it
   * @param id Image ID
   * @returns Hash (ETag) of the image
   */
  async getImageHash(id: string): Promise<string> {
    try {
      const key = `originals/${id}`;
      return await getFileHash(this.s3Client, this.config.s3.bucket, key);
    } catch (error) {
      if (error instanceof HttpError) {
        // Don't log HttpError like NotFoundError as error since it's expected behavior
        throw error;
      }
      const errorMessage = `Failed to get image hash (${id})`;
      log.error(errorMessage, error);
      throw new BadRequestError(errorMessage);
    }
  }

  /**
   * Check the health of the storage integration by verifying that the
   * configured credentials can read from the bucket.
   * @returns HEALTHY if the bucket is reachable, UNHEALTHY otherwise
   */
  async getHealthStatus(): Promise<ApiHealthStatus> {
    const connected = await checkConnection(
      this.s3Client,
      this.config.s3.bucket
    );
    return connected ? ApiHealthStatus.HEALTHY : ApiHealthStatus.UNHEALTHY;
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
          Prefix: 'originals/',
        })
      );

      return (response.Contents || [])
        .map((item) => item.Key || '')
        .filter((key) => key.startsWith('originals/'));
    } catch (error) {
      log.error('Failed to list images:', error);
      return [];
    }
  }

  /**
   * Backfill width/height S3 metadata for images uploaded before dimensions
   * were stored at upload time. Each image is downloaded once to probe its
   * dimensions, the metadata is then rewritten with a server-side self-copy.
   * Safe to re-run, images that already have dimensions are skipped.
   * @param dryRun Only report what would be updated
   * @returns Counts of updated, skipped and failed images
   */
  async backfillImageDimensions(dryRun = false): Promise<ImageBackfillResult> {
    const result: ImageBackfillResult = { updated: 0, skipped: 0, failed: 0 };

    let continuationToken: string | undefined;
    do {
      const response = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.config.s3.bucket,
          Prefix: 'originals/',
          ContinuationToken: continuationToken,
        })
      );
      continuationToken = response.NextContinuationToken;

      for (const item of response.Contents || []) {
        if (!item.Key) {
          continue;
        }

        try {
          const head = await this.s3Client.send(
            new HeadObjectCommand({
              Bucket: this.config.s3.bucket,
              Key: item.Key,
            })
          );

          const s3Metadata: S3Metadata = head.Metadata || {};
          if (s3Metadata.width && s3Metadata.height) {
            result.skipped++;
            continue;
          }

          const { buffer } = await getFileBuffer(
            this.s3Client,
            this.config.s3.bucket,
            item.Key
          );
          const metadata = await sharp(buffer).metadata();

          if (!metadata.width || !metadata.height) {
            log.warning(`No dimensions detected for ${item.Key}, skipping`);
            result.failed++;
            continue;
          }

          if (!dryRun) {
            await this.s3Client.send(
              new CopyObjectCommand({
                Bucket: this.config.s3.bucket,
                CopySource: `${this.config.s3.bucket}/${item.Key}`,
                Key: item.Key,
                MetadataDirective: 'REPLACE',
                // REPLACE drops the content type unless set explicitly
                ContentType: head.ContentType,
                Metadata: {
                  ...head.Metadata,
                  width: String(metadata.width),
                  height: String(metadata.height),
                },
              })
            );
          }

          result.updated++;
          log.info(
            `${dryRun ? 'Would backfill' : 'Backfilled'} dimensions for ${item.Key} (${metadata.width}x${metadata.height})`
          );
        } catch (error) {
          result.failed++;
          log.error(`Failed to backfill dimensions for ${item.Key}`, error);
        }
      }
    } while (continuationToken);

    return result;
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
        withoutEnlargement: true,
      });

      // Set format and quality
      if (format === 'original') {
        // Keep the original format (extension from the file)
        resizedImageBuffer = await sharpInstance.toBuffer();
      } else {
        switch (format) {
          case 'webp':
            resizedImageBuffer = await sharpInstance
              .webp({ quality: this.config.quality })
              .toBuffer();
            break;
          case 'avif':
            resizedImageBuffer = await sharpInstance
              .avif({ quality: this.config.quality })
              .toBuffer();
            break;
          case 'jpeg':
            resizedImageBuffer = await sharpInstance
              .jpeg({ quality: this.config.quality })
              .toBuffer();
            break;
          case 'png':
            resizedImageBuffer = await sharpInstance
              .png({
                quality: this.config.quality
                  ? Math.floor(this.config.quality / 10)
                  : 8,
              })
              .toBuffer();
            break;
          default:
            resizedImageBuffer = await sharpInstance.toBuffer();
        }
      }

      // Upload the resized image
      const outputContentType =
        format === 'original' ? contentType : getMimetypeFromExtension(format);

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.config.s3.bucket,
          Key: `resized/${width}/${id}`,
          Body: resizedImageBuffer,
          ContentType: outputContentType,
        })
      );
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      const errorMessage = `Failed to generate resized image (${id}, ${width})`;
      log.error(errorMessage, error);
      throw new BadRequestError(errorMessage);
    }
  }
}

export const imageService = new ImageService(config.image);
