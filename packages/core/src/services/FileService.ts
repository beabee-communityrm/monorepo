import { ApiHealthStatus, S3Metadata } from '@beabee/beabee-common';

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { HttpError } from 'routing-controllers';
import { Readable } from 'stream';

import {
  BadRequestError,
  NotFoundError,
  UnsupportedFileTypeError,
} from '../errors/index.js';
import { log as mainLogger } from '../logging.js';
import type { FileMetadata, FileServiceConfig } from '../type/index.js';
import {
  getExtensionFromFilename,
  getExtensionFromMimetype,
  getMimetypeFromExtension,
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

/**
 * Base class for services that validate and store a single kind of file in
 * an S3/MinIO bucket under a fixed key prefix (documents, audio, ...).
 * Subclasses supply the type-specific bits (allowed MIME types, key prefix,
 * optional extra content validation); everything else - upload, fetch,
 * delete, hash, existence and health checks - is identical between them.
 */
export abstract class FileService<
  TMetadata extends FileMetadata,
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
  protected abstract readonly allowedMimeTypes: string[];
  protected abstract readonly defaultMimetype: string;
  protected abstract isSupportedType(mimetype: string): boolean;

  /**
   * Optional extra validation beyond the MIME type check (e.g. a magic-byte
   * signature check). No-op by default.
   */
  protected async validateContent(
    _data: Readable,
    _mimetype: string
  ): Promise<void> {
    // Overridden by subclasses that need it
  }

  /**
   * Upload a file to S3/MinIO
   * @param data File data as a stream or buffer
   * @param originalFilename Original filename (optional)
   * @param mimetype MIME type of the file
   * @param owner Owner's contact email (optional)
   * @returns Metadata for the uploaded file
   */
  async upload(
    data: Readable | Buffer,
    originalFilename: string,
    mimetype?: string,
    owner?: string
  ): Promise<TMetadata> {
    try {
      const stream = Buffer.isBuffer(data) ? Readable.from(data) : data;

      const sanitizedFilename = sanitizeFilename(originalFilename);

      // Use the original filename extension if available
      const extWithDot = mimetype
        ? getExtensionFromMimetype(mimetype)
        : getExtensionFromFilename(sanitizedFilename);

      mimetype ||= getMimetypeFromExtension(extWithDot);

      if (mimetype && !this.isSupportedType(mimetype)) {
        throw new UnsupportedFileTypeError(mimetype, this.allowedMimeTypes);
      }
      await this.validateContent(stream, mimetype);

      const fileId = randomUUID();
      const id = `${fileId}${extWithDot}`;
      const contentType = mimetype || this.defaultMimetype;

      const s3Metadata: S3Metadata = {};
      if (sanitizedFilename) {
        s3Metadata.originalfilename = sanitizedFilename;
      }
      if (owner) {
        s3Metadata.owner = owner;
      }

      await putFileStream(
        this.s3Client,
        this.config.s3.bucket,
        `${this.keyPrefix}/${id}`,
        stream,
        contentType,
        Object.keys(s3Metadata).length > 0
          ? (s3Metadata as Record<string, string>)
          : undefined
      );

      // Size, hash, createdAt etc. come from a single HeadObject request
      return await this.getMetadata(id);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.log.error(`Failed to upload ${this.typeName}:`, error);
      throw new BadRequestError(
        `Failed to upload ${this.typeName}: ` + errorMessage
      );
    }
  }

  /**
   * Get a file stream
   * @param id File ID
   * @returns Stream of the file and content type
   */
  async getStream(
    id: string
  ): Promise<{ stream: Readable; contentType: string }> {
    try {
      return await getFileStream(
        this.s3Client,
        this.config.s3.bucket,
        `${this.keyPrefix}/${id}`
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.log.error(`Failed to get ${this.typeName} stream:`, error);
      throw new BadRequestError(`Failed to get ${this.typeName}`);
    }
  }

  /**
   * Get a file as a buffer
   * @param id File ID
   * @returns Buffer of the file and content type
   */
  async getBuffer(
    id: string
  ): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      return await getFileBuffer(
        this.s3Client,
        this.config.s3.bucket,
        `${this.keyPrefix}/${id}`
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.log.error(`Failed to get ${this.typeName} buffer:`, error);
      throw new BadRequestError(`Failed to get ${this.typeName}`);
    }
  }

  /**
   * Delete a file
   * @param id File ID
   * @returns True if deleted successfully
   */
  async delete(id: string): Promise<boolean> {
    try {
      // Check if the file exists
      await this.getMetadata(id);

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.config.s3.bucket,
          Key: `${this.keyPrefix}/${id}`,
        })
      );

      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.log.error(`Failed to delete ${this.typeName}:`, error);
      throw new BadRequestError(`Failed to delete ${this.typeName}`);
    }
  }

  /**
   * Get metadata for a file
   * @param id File ID
   * @returns File metadata
   */
  async getMetadata(id: string): Promise<TMetadata> {
    try {
      const key = `${this.keyPrefix}/${id}`;
      const headObject = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.config.s3.bucket,
          Key: key,
        })
      );

      if (!headObject) {
        throw new NotFoundError();
      }

      const s3Metadata = headObject.Metadata || {};

      // Subclasses only ever add extra fields on top of this shape (e.g.
      // ImageService adds width/height from the same s3Metadata), so this
      // is always a valid TMetadata in practice.
      return {
        id,
        mimetype: headObject.ContentType || 'application/octet-stream',
        createdAt: headObject.LastModified || new Date(),
        size: headObject.ContentLength || 0,
        filename: s3Metadata.originalfilename,
        owner: s3Metadata.owner,
        hash: headObject.ETag ? headObject.ETag.replace(/"/g, '') : '',
      } as TMetadata;
    } catch (error) {
      this.log.error(`Failed to get ${this.typeName} metadata:`, error);
      throw new NotFoundError();
    }
  }

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
