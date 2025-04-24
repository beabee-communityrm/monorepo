import { Request, Response } from "express";
import {
  Authorized,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  NotFoundError,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedError
} from "routing-controllers";
import { MulterError } from "multer";

import { documentService } from "@beabee/core/services";
import { Contact } from "@beabee/core/models";
import { BadRequestError } from "@beabee/core/errors";
import { uploadMiddleware } from "../middlewares";
import { config } from "@beabee/core/config";
import { isSupportedDocumentType } from "@beabee/beabee-common";

import type { UploadFileResponse } from "@beabee/beabee-common";

@JsonController("/documents")
export class DocumentController {
  /**
   * Upload a new document
   */
  @Post("/")
  @Authorized()
  async upload(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser({ required: false }) contact?: Contact
  ): Promise<UploadFileResponse> {
    try {
      // Apply multer middleware to handle file upload
      await uploadMiddleware(req, res);

      if (!req.file) {
        throw new BadRequestError({ message: "No document file provided" });
      }

      // Verify file type is allowed - multer handles size but we still check type
      if (!isSupportedDocumentType(req.file.mimetype)) {
        throw new BadRequestError({
          message: "Unsupported document type. Please upload a PDF document."
        });
      }

      // Use the DocumentService to upload the file with owner information
      const metadata = await documentService.uploadDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        contact?.email // Add the owner information if available
      );

      // Create response object
      const response: UploadFileResponse = {
        id: metadata.id,
        url: `${config.audience}/api/1.0/documents/${metadata.id}`,
        hash: metadata.hash
      };

      // Only add filename if it exists
      if (metadata.filename) {
        response.filename = metadata.filename;
      }

      return response;
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }

      if (error instanceof MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          throw new BadRequestError({ message: "File too large (max 20MB)" });
        }
        throw new BadRequestError({
          message: `Upload error: ${error.message}`
        });
      }

      throw new BadRequestError({ message: "Failed to upload document" });
    }
  }

  /**
   * Get a document
   */
  @Get("/:id")
  async getDocument(
    @Res() res: Response,
    @Param("id") id: string
  ): Promise<Buffer> {
    try {
      // Get document as buffer
      const documentData = await documentService.getDocumentBuffer(id);

      // Get document metadata to check permissions if needed in the future
      const metadata = await documentService.getDocumentMetadata(id);

      // Set appropriate security headers
      res.set({
        "Content-Type": documentData.contentType,
        "Content-Disposition": `inline; filename="${metadata.filename || id}"`,
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'self'",
        "X-Frame-Options": "DENY"
      });

      // Return the buffer, routing-controllers will handle the rest
      return documentData.buffer;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundError("Document not found");
      }
      console.error("Error retrieving document:", error);
      throw new BadRequestError({ message: "Failed to retrieve document" });
    }
  }

  /**
   * Delete a document
   */
  @Delete("/:id")
  @Authorized()
  async deleteDocument(
    @Param("id") id: string,
    @CurrentUser({ required: true }) contact: Contact
  ): Promise<{ success: boolean }> {
    try {
      // Get document metadata first to check ownership
      const metadata = await documentService.getDocumentMetadata(id);

      // Check if the user is the owner of the document
      // Only allow the document owner or admins to delete documents
      if (
        metadata.owner &&
        metadata.owner !== contact.email &&
        !contact.hasRole("admin")
      ) {
        throw new UnauthorizedError(
          "You don't have permission to delete this document"
        );
      }

      const success = await documentService.deleteDocument(id);
      return { success };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new BadRequestError({ message: "Failed to delete document" });
    }
  }
}
