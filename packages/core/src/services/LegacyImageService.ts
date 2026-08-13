import { NoSuchKey, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

import config from '../config/config.js';
import { BadRequestError, NotFoundError } from '../errors/index.js';
import { log as mainLogger } from '../logging.js';
import type { LegacyImageServiceConfig } from '../type/index.js';
import { getFileStream } from '../utils/s3.js';

const log = mainLogger.child({ app: 'legacy-image-service' });

/**
 * Read-only service for serving legacy uploads that were mirrored verbatim
 * into S3/MinIO under the `legacy-images/` prefix. The mirror preserves the
 * original disk layout where each image lives at `<name>/<name>`.
 */
export class LegacyImageService {
  private readonly s3Client: S3Client;

  /**
   * Create a new LegacyImageService
   * @param config Service configuration
   */
  constructor(private readonly config: LegacyImageServiceConfig) {
    this.s3Client = new S3Client({
      endpoint: this.config.s3.endpoint,
      region: this.config.s3.region,
      credentials: {
        accessKeyId: this.config.s3.accessKey,
        secretAccessKey: this.config.s3.secretKey,
      },
      forcePathStyle: this.config.s3.forcePathStyle !== false,
    });
  }

  /**
   * Get a legacy image stream
   * @param filename Legacy image filename
   * @returns Stream of the image and content type
   */
  async getLegacyImageStream(
    filename: string
  ): Promise<{ stream: Readable; contentType: string }> {
    if (
      !filename ||
      filename.includes('/') ||
      filename.includes('\\') ||
      filename.includes('..')
    ) {
      throw new BadRequestError('Invalid legacy image filename');
    }

    try {
      return await getFileStream(
        this.s3Client,
        this.config.s3.bucket,
        `legacy-images/${filename}/${filename}`
      );
    } catch (error) {
      // Missing keys surface as NoSuchKey from the SDK, map them to a 404
      if (error instanceof NoSuchKey || error instanceof NotFoundError) {
        throw new NotFoundError();
      }
      log.error(`Failed to get legacy image stream (${filename})`, error);
      throw new BadRequestError('Failed to get legacy image');
    }
  }
}

export const legacyImageService = new LegacyImageService(config.legacyImage);
