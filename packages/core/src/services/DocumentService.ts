import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  ApiHealthStatus,
  S3Metadata,
  isSupportedDocumentType,
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
import type { DocumentMetadata, DocumentServiceConfig } from '../type/index.js';
import {
  getExtensionFromFilename,
  getExtensionFromMimetype,
  getMimetypeFromExtension,
  peekStreamBytes,
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

const log = mainLogger.child({ app: 'document-service' });

/**
 * Service for handling document uploads and storage in S3/MinIO
 */
export class DocumentService {
  private readonly s3Client: S3Client;
  private readonly config: DocumentServiceConfig;

  /**
   * Create a new DocumentService
   * @param config Service configuration
   */
  constructor(config: DocumentServiceConfig) {
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
   * Validate document content
   * @param documentData Document data stream
   * @param mimetype MIME type
   */
  private async validateDocument(
    documentData: Readable,
    mimetype: string
  ): Promise<void> {
    // Validate mimetype if provided
    if (mimetype && !isSupportedDocumentType(mimetype)) {
      throw new UnsupportedFileTypeError(mimetype, ALLOWED_DOCUMENT_MIME_TYPES);
    }

    // Basic PDF signature check for PDF files
    if (mimetype === 'application/pdf') {
      const pdfSignature = await peekStreamBytes(documentData, 4);
      if (pdfSignature.length < 4) {
        throw new BadRequestError('Invalid PDF format. File is too small.');
      }
      if (pdfSignature.toString('ascii') !== '%PDF') {
        throw new BadRequestError(
          'Invalid PDF format. The file does not appear to be a valid PDF.'
        );
      }
    }
  }

  /**
   * Upload a document to S3/MinIO
   * @param documentData Document data as a stream or buffer
   * @param originalFilename Original filename (optional)
   * @param mimetype MIME type of the document
   * @param owner Owner's contact email (optional)
   * @returns Metadata for the uploaded document
   */
  async uploadDocument(
    documentData: Readable | Buffer,
    originalFilename: string,
    mimetype?: string,
    owner?: string
  ): Promise<DocumentMetadata> {
    try {
      const stream = Buffer.isBuffer(documentData)
        ? Readable.from(documentData)
        : documentData;

      // Sanitize original filename if provided
      const sanitizedFilename = sanitizeFilename(originalFilename);

      // Use the original filename extension if available
      const extWithDot = mimetype
        ? getExtensionFromMimetype(mimetype)
        : getExtensionFromFilename(sanitizedFilename);

      mimetype ||= getMimetypeFromExtension(extWithDot);

      // Validate document content and type
      await this.validateDocument(stream, mimetype);

      // Generate a unique ID for the document
      const fileId = randomUUID();

      const id = `${fileId}${extWithDot}`;
      const contentType = mimetype || 'application/pdf';

      // Prepare metadata for S3
      const metadata: S3Metadata = {};
      if (sanitizedFilename) {
        metadata.originalfilename = sanitizedFilename;
      }
      if (owner) {
        metadata.owner = owner;
      }

      // Upload the document
      await putFileStream(
        this.s3Client,
        this.config.s3.bucket,
        `documents/${id}`,
        stream,
        contentType,
        Object.keys(metadata).length > 0
          ? (metadata as Record<string, string>)
          : undefined
      );

      // Size, hash, createdAt etc. come from a single HeadObject request
      return await this.getDocumentMetadata(id);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      log.error('Failed to upload document:', error);
      throw new BadRequestError('Failed to upload document: ' + errorMessage);
    }
  }

  /**
   * Get a document stream
   * @param id Document ID
   * @returns Stream of the document and content type
   */
  async getDocumentStream(
    id: string
  ): Promise<{ stream: Readable; contentType: string }> {
    try {
      return await getFileStream(
        this.s3Client,
        this.config.s3.bucket,
        `documents/${id}`
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      log.error('Failed to get document stream:', error);
      throw new BadRequestError('Failed to get document');
    }
  }

  /**
   * Get a document as a buffer
   * @param id Document ID
   * @returns Buffer of the document and content type
   */
  async getDocumentBuffer(
    id: string
  ): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      return await getFileBuffer(
        this.s3Client,
        this.config.s3.bucket,
        `documents/${id}`
      );
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      log.error('Failed to get document buffer:', error);
      throw new BadRequestError('Failed to get document');
    }
  }

  /**
   * Delete a document
   * @param id Document ID
   * @returns True if deleted successfully
   */
  async deleteDocument(id: string): Promise<boolean> {
    try {
      // Check if document exists
      await this.getDocumentMetadata(id);

      // Delete the document
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.config.s3.bucket,
          Key: `documents/${id}`,
        })
      );

      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      log.error('Failed to delete document:', error);
      throw new BadRequestError('Failed to delete document');
    }
  }

  /**
   * Get metadata for a document
   * @param id Document ID
   * @returns Document metadata
   */
  async getDocumentMetadata(id: string): Promise<DocumentMetadata> {
    try {
      const key = `documents/${id}`;
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
      log.error('Failed to get document metadata:', error);
      throw new NotFoundError();
    }
  }

  /**
   * Get the hash (ETag) of a document without downloading it
   * @param id Document ID
   * @returns Hash (ETag) of the document
   */
  async getDocumentHash(id: string): Promise<string> {
    try {
      const key = `documents/${id}`;
      return await getFileHash(this.s3Client, this.config.s3.bucket, key);
    } catch (error) {
      log.error('Failed to get document hash:', error);
      throw new NotFoundError();
    }
  }

  /**
   * Check if a document exists
   * @param id Document ID
   * @returns True if the document exists
   */
  async documentExists(id: string): Promise<boolean> {
    return fileExists(this.s3Client, this.config.s3.bucket, `documents/${id}`);
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
   * List all documents
   * @returns Array of document IDs
   */
  async listDocuments(): Promise<string[]> {
    try {
      const response = await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.config.s3.bucket,
          Prefix: 'documents/',
        })
      );

      return (response.Contents || [])
        .map((item) => {
          const key = item.Key || '';
          return key.replace('documents/', '');
        })
        .filter(Boolean);
    } catch (error) {
      log.error('Failed to list documents:', error);
      return [];
    }
  }
}

export const documentService = new DocumentService(config.document);
