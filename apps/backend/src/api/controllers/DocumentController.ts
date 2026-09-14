import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  isSupportedDocumentType,
} from '@beabee/beabee-common';
import type { UploadFileResponse } from '@beabee/beabee-common';
import { Contact } from '@beabee/core/models';
import { DocumentMetadata, documentService } from '@beabee/core/services';

import { Request, Response } from 'express';
import {
  Authorized,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Req,
  Res,
  UseBefore,
} from 'routing-controllers';
import { Readable } from 'stream';

import { RateLimit } from '../decorators/index.js';
import { FileController } from './FileController.js';

@JsonController('/documents')
export class DocumentController extends FileController<DocumentMetadata> {
  protected readonly typeName = 'document';
  protected readonly pathPrefix = 'documents';
  protected readonly allowedMimeTypes = ALLOWED_DOCUMENT_MIME_TYPES;
  protected readonly contentSecurityPolicy = "default-src 'self'";

  protected isSupportedType(mimetype: string): boolean {
    return isSupportedDocumentType(mimetype);
  }

  protected uploadFile(
    stream: Readable,
    filename: string,
    mimetype: string,
    owner?: string
  ): Promise<DocumentMetadata> {
    return documentService.upload(stream, filename, mimetype, owner);
  }

  protected getFileMetadata(id: string): Promise<DocumentMetadata> {
    return documentService.getMetadata(id);
  }

  protected getFileStream(id: string) {
    return documentService.getStream(id);
  }

  protected deleteFile(id: string): Promise<boolean> {
    return documentService.delete(id);
  }

  /**
   * Upload a new document
   */
  @Post('/')
  @Authorized()
  @UseBefore(
    RateLimit({
      guest: { points: 5, duration: 60 * 60 },
      user: { points: 50, duration: 60 * 60 },
    })
  )
  upload(
    @Req() req: Request,
    @CurrentUser({ required: false }) contact?: Contact
  ): Promise<UploadFileResponse> {
    return this.handleUpload(req, contact?.email);
  }

  /**
   * Get a document
   */
  @Get('/:id')
  get(@Res() res: Response, @Param('id') id: string): Promise<Response> {
    return this.handleGet(res, id);
  }

  /**
   * Delete a document
   */
  @Delete('/:id')
  @Authorized()
  delete(
    @Param('id') id: string,
    @CurrentUser({ required: true }) contact: Contact
  ): Promise<{ success: boolean }> {
    return this.handleDelete(id, contact);
  }
}
