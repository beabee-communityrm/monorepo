import { isSupportedDocumentType } from '@beabee/beabee-common';
import type { UploadFileResponse } from '@beabee/beabee-common';
import { MAX_FILE_SIZE_IN_BYTES } from '@beabee/beabee-common';
import { config } from '@beabee/core/config';
import { BadRequestError } from '@beabee/core/errors';
import { UnsupportedFileType } from '@beabee/core/errors';
import { Contact } from '@beabee/core/models';
import { documentService } from '@beabee/core/services';
import { convertMulterError } from '@beabee/core/utils/multer';

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
  UnauthorizedError,
  UseBefore,
} from 'routing-controllers';

import { RateLimit } from '../decorators';
import { uploadMiddleware } from '../middlewares';

@JsonController('/documents')
export class DocumentController {
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
  async upload(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser({ required: false }) contact?: Contact
  ): Promise<UploadFileResponse> {
    try {
      // Apply multer middleware to handle file upload
      await uploadMiddleware(req, res);
    } catch (error) {
      // Convert MulterError to appropriate HttpError
      throw convertMulterError(error, MAX_FILE_SIZE_IN_BYTES);
    }

    if (!req.file) {
      throw new BadRequestError({ message: 'No document file provided' });
    }

    // Verify file type is allowed - multer handles size but we still check type
    if (!isSupportedDocumentType(req.file.mimetype)) {
      throw new UnsupportedFileType({
        message: 'Unsupported document type. Please upload a PDF document.',
      });
    }

    // Use the DocumentService to upload the file with owner information
    const metadata = await documentService.uploadDocument(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      contact?.email // Add the owner information if available
    );

    const path = `documents/${metadata.id}`;

    // Create response object
    const response: UploadFileResponse = {
      id: metadata.id,
      url: `${config.audience}/api/1.0/${path}`,
      path,
      hash: metadata.hash,
    };

    // Only add filename if it exists
    if (metadata.filename) {
      response.filename = metadata.filename;
    }

    return response;
  }

  /**
   * Get a document
   */
  @Get('/:id')
  async getDocument(
    @Res() res: Response,
    @Param('id') id: string
  ): Promise<Buffer> {
    // Get document as buffer
    const documentData = await documentService.getDocumentBuffer(id);

    // Get document metadata to check permissions if needed in the future
    const metadata = await documentService.getDocumentMetadata(id);

    // Set appropriate security headers
    res.set({
      'Content-Type': documentData.contentType,
      'Content-Disposition': `inline; filename="${metadata.filename || id}"`,
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'",
      'X-Frame-Options': 'SAMEORIGIN',
    });

    // Return the buffer, routing-controllers will handle the rest
    return documentData.buffer;
  }

  /**
   * Delete a document
   */
  @Delete('/:id')
  @Authorized()
  async deleteDocument(
    @Param('id') id: string,
    @CurrentUser({ required: true }) contact: Contact
  ): Promise<{ success: boolean }> {
    // Get document metadata first to check ownership
    const metadata = await documentService.getDocumentMetadata(id);

    // Check if the user is the owner of the document
    // Only allow the document owner or admins to delete documents
    if (
      metadata.owner &&
      metadata.owner !== contact.email &&
      !contact.hasRole('admin')
    ) {
      throw new UnauthorizedError(
        "You don't have permission to delete this document"
      );
    }

    const success = await documentService.deleteDocument(id);
    return { success };
  }
}
