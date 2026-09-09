import {
  ALLOWED_AUDIO_MIME_TYPES,
  ApiHealthStatus,
  S3Metadata,
  isSupportedAudioType,
} from '@beabee/beabee-common';

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { HttpError } from 'routing-controllers';
import { Readable } from 'stream';

import config from '../config/config.js';
import {
  BadRequestError,
  NotFoundError,
  UnsupportedFileTypeError,
} from '../errors/index.js';
import { log as mainLogger } from '../logging.js';
import type { AudioMetadata, AudioServiceConfig } from '../type/index.js';
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

const log = mainLogger.child({ app: 'audio-service' });

/**
 * Service for handling audio uploads and storage in S3/MinIO
 */
export class AudioService {
  private readonly s3Client: S3Client;
  private readonly config: AudioServiceConfig;

  /**
   * Create a new AudioService
   * @param config Service configuration
   */
  constructor(config: AudioServiceConfig) {
    this.config = config;

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
   * Validate audio mimetype
   * @param mimetype MIME type
   */
  private validateAudio(mimetype: string): void {
    if (mimetype && !isSupportedAudioType(mimetype)) {
      throw new UnsupportedFileTypeError(mimetype, ALLOWED_AUDIO_MIME_TYPES);
    }
  }

  /**
   * Upload an audio file to S3/MinIO
   * @param audioData Audio data as a stream or buffer
   * @param originalFilename Original filename (optional)
   * @param mimetype MIME type of the audio file
   * @param owner Owner's contact email (optional)
   * @returns Metadata for the uploaded audio file
   */
  async uploadAudio(
    audioData: Readable | Buffer,
    originalFilename: string,
    mimetype?: string,
    owner?: string
  ): Promise<AudioMetadata> {
    try {
      const stream = Buffer.isBuffer(audioData)
        ? Readable.from(audioData)
        : audioData;

      // Sanitize original filename if provided
      const sanitizedFilename = sanitizeFilename(originalFilename);

      // Use the original filename extension if available
      const extWithDot = mimetype
        ? getExtensionFromMimetype(mimetype)
        : getExtensionFromFilename(sanitizedFilename);

      mimetype ||= getMimetypeFromExtension(extWithDot);

      // Validate audio mimetype
      this.validateAudio(mimetype);

      // Generate a unique ID for the audio file
      const fileId = randomUUID();

      const id = `${fileId}${extWithDot}`;
      const contentType = mimetype || 'audio/webm';

      // Prepare metadata for S3
      const metadata: S3Metadata = {};
      if (sanitizedFilename) {
        metadata.originalfilename = sanitizedFilename;
      }
      if (owner) {
        metadata.owner = owner;
      }

      // Upload the audio file
      await putFileStream(
        this.s3Client,
        this.config.s3.bucket,
        `audio/${id}`,
        stream,
        contentType,
        Object.keys(metadata).length > 0
          ? (metadata as Record<string, string>)
          : undefined
      );

      // Size, hash, createdAt etc. come from a single HeadObject request
      return await this.getAudioMetadata(id);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      log.error('Failed to upload audio:', error);
      throw new BadRequestError('Failed to upload audio: ' + errorMessage);
    }
  }

  /**
   * Get an audio file stream
   * @param id Audio file ID
   * @returns Stream of the audio file and content type
   */
  async getAudioStream(
    id: string
  ): Promise<{ stream: Readable; contentType: string }> {
    try {
      return await getFileStream(
        this.s3Client,
        this.config.s3.bucket,
        `audio/${id}`
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      log.error('Failed to get audio stream:', error);
      throw new BadRequestError('Failed to get audio');
    }
  }

  /**
   * Get an audio file as a buffer
   * @param id Audio file ID
   * @returns Buffer of the audio file and content type
   */
  async getAudioBuffer(
    id: string
  ): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      return await getFileBuffer(
        this.s3Client,
        this.config.s3.bucket,
        `audio/${id}`
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      log.error('Failed to get audio buffer:', error);
      throw new BadRequestError('Failed to get audio');
    }
  }

  /**
   * Delete an audio file
   * @param id Audio file ID
   * @returns True if deleted successfully
   */
  async deleteAudio(id: string): Promise<boolean> {
    try {
      // Check if audio file exists
      await this.getAudioMetadata(id);

      // Delete the audio file
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.config.s3.bucket,
          Key: `audio/${id}`,
        })
      );

      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      log.error('Failed to delete audio:', error);
      throw new BadRequestError('Failed to delete audio');
    }
  }

  /**
   * Get metadata for an audio file
   * @param id Audio file ID
   * @returns Audio file metadata
   */
  async getAudioMetadata(id: string): Promise<AudioMetadata> {
    try {
      const key = `audio/${id}`;
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

      return {
        id,
        mimetype: headObject.ContentType || 'application/octet-stream',
        createdAt: headObject.LastModified || new Date(),
        size: headObject.ContentLength || 0,
        filename: s3Metadata.originalfilename,
        owner: s3Metadata.owner,
        hash: headObject.ETag ? headObject.ETag.replace(/"/g, '') : '',
      };
    } catch (error) {
      log.error('Failed to get audio metadata:', error);
      throw new NotFoundError();
    }
  }

  /**
   * Get the hash (ETag) of an audio file without downloading it
   * @param id Audio file ID
   * @returns Hash (ETag) of the audio file
   */
  async getAudioHash(id: string): Promise<string> {
    try {
      const key = `audio/${id}`;
      return await getFileHash(this.s3Client, this.config.s3.bucket, key);
    } catch (error) {
      log.error('Failed to get audio hash:', error);
      throw new NotFoundError();
    }
  }

  /**
   * Check if an audio file exists
   * @param id Audio file ID
   * @returns True if the audio file exists
   */
  async audioExists(id: string): Promise<boolean> {
    return fileExists(this.s3Client, this.config.s3.bucket, `audio/${id}`);
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
   * List all audio files
   * @returns Array of audio file IDs
   */
  async listAudio(): Promise<string[]> {
    try {
      const response = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.config.s3.bucket,
          Prefix: 'audio/',
        })
      );

      return (response.Contents || [])
        .map((item) => {
          const key = item.Key || '';
          return key.replace('audio/', '');
        })
        .filter(Boolean);
    } catch (error) {
      log.error('Failed to list audio:', error);
      return [];
    }
  }
}

export const audioService = new AudioService(config.audio);
