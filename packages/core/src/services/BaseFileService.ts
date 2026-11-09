import { S3Metadata } from '@beabee/beabee-common';

import { DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { HttpError } from 'routing-controllers';
import { Readable } from 'stream';

import {
  BadRequestError,
  NotFoundError,
  UnsupportedFileTypeError,
} from '../errors/index.js';
import type { FileMetadata, FileServiceConfig } from '../type/index.js';
import {
  getExtensionFromFilename,
  getExtensionFromMimetype,
  getMimetypeFromExtension,
  sanitizeFilename,
} from '../utils/file.js';
import { getFileBuffer, getFileStream, putFileStream } from '../utils/s3.js';
import { BaseS3ObjectService } from './BaseS3ObjectService.js';

/**
 * Base class for services that validate and store a single kind of file in
 * an S3/MinIO bucket under a fixed key prefix (documents, audio, ...).
 * Subclasses supply the type-specific bits (allowed MIME types, optional
 * extra content validation); upload, fetch and delete are identical
 * between them. Extends BaseS3ObjectService for the S3 client, the type
 * check, and the operations that don't need file-upload semantics
 * (exists/hash/list/health).
 */
export abstract class BaseFileService<
  TMetadata extends FileMetadata,
  TConfig extends FileServiceConfig = FileServiceConfig,
> extends BaseS3ObjectService<TConfig> {
  protected abstract readonly defaultMimetype: string;

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
}
