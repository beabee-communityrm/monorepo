import { ApiHealthStatus } from '@beabee/beabee-common';

import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

import { NotFoundError } from '../errors/index.js';
import { log as mainLogger } from '../logging.js';
import type { FileServiceConfig } from '../type/index.js';
import { checkConnection, fileExists, getFileHash } from '../utils/s3.js';

/**
 * Base class for services that store objects in an S3/MinIO bucket under a
 * fixed key prefix. Holds the S3 client and the operations that only care
 * about a keyed object in a bucket - exists, hash, list, health - with no
 * opinion about what the object is, how it's validated, or how it got
 * there. BaseFileService extends this to add an upload/fetch/delete template
 * for Document and Audio; ImageService extends it directly, since its own
 * upload/get/delete pipeline (resizing, format negotiation, ...) doesn't
 * fit that template.
 */
export abstract class BaseS3ObjectService<
  TConfig extends FileServiceConfig = FileServiceConfig,
> {
  protected readonly s3Client: S3Client;

  constructor(protected readonly config: TConfig) {
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

  // Lazy: a subclass's own field initializers (e.g. `loggerName = '...'`)
  // only run after this base constructor returns, so `this.loggerName`
  // isn't available yet if built eagerly in the constructor above.
  private _log?: typeof mainLogger;
  protected get log(): typeof mainLogger {
    this._log ??= mainLogger.child({ app: this.loggerName });
    return this._log;
  }

  /** S3 key prefix this file type is stored under, e.g. "documents" */
  protected abstract readonly keyPrefix: string;
  /** Human-readable name used in error messages, e.g. "document" */
  protected abstract readonly typeName: string;
  /** child logger app name, e.g. "document-service" */
  protected abstract readonly loggerName: string;

  /**
   * Get the hash (ETag) of a file without downloading it
   * @param id File ID
   * @returns Hash (ETag) of the file
   */
  async getHash(id: string): Promise<string> {
    try {
      const key = `${this.keyPrefix}/${id}`;
      return await getFileHash(this.s3Client, this.config.s3.bucket, key);
    } catch (error) {
      this.log.error(`Failed to get ${this.typeName} hash:`, error);
      throw new NotFoundError();
    }
  }

  /**
   * Check if a file exists
   * @param id File ID
   * @returns True if the file exists
   */
  async exists(id: string): Promise<boolean> {
    return fileExists(
      this.s3Client,
      this.config.s3.bucket,
      `${this.keyPrefix}/${id}`
    );
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
   * List all files of this type
   * @returns Array of file IDs
   */
  async list(): Promise<string[]> {
    try {
      const response = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.config.s3.bucket,
          Prefix: `${this.keyPrefix}/`,
        })
      );

      return (response.Contents || [])
        .map((item) => (item.Key || '').replace(`${this.keyPrefix}/`, ''))
        .filter(Boolean);
    } catch (error) {
      this.log.error(`Failed to list ${this.typeName}s:`, error);
      return [];
    }
  }
}
