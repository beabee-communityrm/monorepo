import { randomUUID } from "crypto";
import { Readable } from "stream";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand
} from "@aws-sdk/client-s3";

import type { DocumentServiceConfig, DocumentMetadata } from "../type/index";
import { BadRequestError, NotFoundError } from "../errors";
import { log as mainLogger } from "../logging";
import {
  checkConnection,
  getFileBuffer,
  getFileStream,
  fileExists,
  getFileHash
} from "../utils/s3";
import {
  getExtensionFromFilename,
  getExtensionFromMimetype,
  getMimetypeFromExtension,
  sanitizeFilename
} from "../utils/file";
import { isSupportedDocumentType } from "@beabee/beabee-common";
import config from "../config/config";

const log = mainLogger.child({ app: "document-service" });

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
        secretAccessKey: this.config.s3.secretKey
      },
      forcePathStyle: this.config.s3.forcePathStyle !== false
    });
  }

  /**
   * Validate document content
   * @param documentData Document data
   * @param mimetype MIME type
   */
  private validateDocument(documentData: Buffer, mimetype: string): void {
    // Validate mimetype if provided
    if (mimetype && !isSupportedDocumentType(mimetype)) {
      throw new BadRequestError({
        message:
          "Unsupported document type. Please upload a PDF or Office document."
      });
    }

    // Basic PDF signature check for PDF files
    if (mimetype === "application/pdf") {
      if (documentData.length < 4) {
        throw new BadRequestError({
          message: "Invalid PDF format. File is too small."
        });
      }
      const pdfSignature = documentData.toString("ascii", 0, 4);
      if (pdfSignature !== "%PDF") {
        throw new BadRequestError({
          message:
            "Invalid PDF format. The file does not appear to be a valid PDF."
        });
      }
    }
  }

  /**
   * Upload a document to S3/MinIO
   * @param documentData Binary document data
   * @param originalFilename Original filename (optional)
   * @param mimetype MIME type of the document
   * @param owner Owner's contact email (optional)
   * @returns Metadata for the uploaded document
   */
  async uploadDocument(
    documentData: Buffer,
    originalFilename: string,
    mimetype?: string,
    owner?: string
  ): Promise<DocumentMetadata> {
    try {
      // Validate input
      if (!Buffer.isBuffer(documentData)) {
        throw new BadRequestError({ message: "Invalid upload format" });
      }

      // Sanitize original filename if provided
      const sanitizedFilename = sanitizeFilename(originalFilename);

      // Use the original filename extension if available
      const extension = mimetype
        ? getExtensionFromMimetype(mimetype)
        : getExtensionFromFilename(sanitizedFilename);

      mimetype ||= getMimetypeFromExtension(extension);

      // Validate document content and type
      this.validateDocument(documentData, mimetype);

      // Generate a unique ID for the document
      const fileId = randomUUID();

      const id = `${fileId}${extension}`;
      const contentType = mimetype || "application/pdf";

      // Prepare metadata for S3
      const metadata: Record<string, string> = {};
      if (sanitizedFilename) {
        metadata.originalFilename = sanitizedFilename;
      }
      if (owner) {
        metadata.owner = owner;
      }

      // Upload the document
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.config.s3.bucket,
          Key: `documents/${id}`,
          Body: documentData,
          ContentType: contentType,
          Metadata: Object.keys(metadata).length > 0 ? metadata : undefined
        })
      );

      // Get the hash (ETag) of the uploaded document
      const hash = await this.getDocumentHash(id);

      // Return metadata
      return {
        id,
        mimetype: contentType,
        createdAt: new Date(),
        size: documentData.length,
        filename: sanitizedFilename,
        owner,
        hash
      };
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      log.error("Failed to upload document:", error);
      throw new BadRequestError({ message: "Failed to upload document" });
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
      log.error("Failed to get document stream:", error);
      throw new BadRequestError({ message: "Failed to get document" });
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
      log.error("Failed to get document buffer:", error);
      throw new BadRequestError({ message: "Failed to get document" });
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
          Key: `documents/${id}`
        })
      );

      return true;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      log.error("Failed to delete document:", error);
      throw new BadRequestError({ message: "Failed to delete document" });
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
          Key: key
        })
      );

      if (!headObject) {
        throw new NotFoundError();
      }

      const s3Metadata = headObject.Metadata || {};

      return {
        id,
        mimetype: headObject.ContentType || "application/octet-stream",
        createdAt: headObject.LastModified || new Date(),
        size: headObject.ContentLength || 0,
        filename: s3Metadata.originalfilename,
        owner: s3Metadata.owner,
        hash: headObject.ETag ? headObject.ETag.replace(/"/g, "") : ""
      };
    } catch (error) {
      log.error("Failed to get document metadata:", error);
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
      log.error("Failed to get document hash:", error);
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
   * Check connection to S3/MinIO
   * @returns True if connection is successful
   */
  async checkConnection(): Promise<boolean> {
    return checkConnection(this.s3Client, this.config.s3.bucket);
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
          Prefix: "documents/"
        })
      );

      return (response.Contents || [])
        .map((item) => {
          const key = item.Key || "";
          return key.replace("documents/", "");
        })
        .filter(Boolean);
    } catch (error) {
      log.error("Failed to list documents:", error);
      return [];
    }
  }
}

export const documentService = new DocumentService(config.document);
