import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  isSupportedDocumentType,
} from '@beabee/beabee-common';

import { Readable } from 'stream';

import config from '../config/config.js';
import { BadRequestError } from '../errors/index.js';
import type { FileMetadata } from '../type/index.js';
import { peekStreamBytes } from '../utils/file.js';
import { FileService } from './FileService.js';

export type DocumentMetadata = FileMetadata;

/**
 * Service for handling document uploads and storage in S3/MinIO
 */
export class DocumentService extends FileService<DocumentMetadata> {
  protected readonly keyPrefix = 'documents';
  protected readonly typeName = 'document';
  protected readonly loggerName = 'document-service';
  protected readonly allowedMimeTypes = ALLOWED_DOCUMENT_MIME_TYPES;
  protected readonly defaultMimetype = 'application/pdf';

  protected isSupportedType(mimetype: string): boolean {
    return isSupportedDocumentType(mimetype);
  }

  /** Basic PDF signature check for PDF files */
  protected override async validateContent(
    data: Readable,
    mimetype: string
  ): Promise<void> {
    if (mimetype !== 'application/pdf') {
      return;
    }
    const pdfSignature = await peekStreamBytes(data, 4);
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

export const documentService = new DocumentService(config.document);
