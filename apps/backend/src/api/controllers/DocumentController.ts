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
  Res
} from "routing-controllers";
import { MulterError } from "multer";

import { documentService } from "@beabee/core/services";
import { Contact } from "@beabee/core/models";
import { BadRequestError } from "@beabee/core/errors";
import { uploadMiddleware } from "../middlewares";
import { config } from "@beabee/core/config";

import type { UploadFileResponse } from "@beabee/beabee-common";

@JsonController("/documents")
export class DocumentController {
  /**
   * Upload a new document
   */
  @Post("/")
  async upload(
    @CurrentUser({ required: true }) contact: Contact,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<UploadFileResponse> {
    try {
      // Apply multer middleware to handle file upload
      await uploadMiddleware(req, res);

      if (!req.file) {
        throw new BadRequestError({ message: "No document file provided" });
      }

      // Use the DocumentService to upload the file
      const metadata = await documentService.uploadDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      // Create response object
      const response: UploadFileResponse = {
        id: metadata.id,
        url: `${config.audience}/api/1.0/documents/${metadata.id}`
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

      // Set appropriate headers
      res.set({
        "Content-Type": documentData.contentType,
        "Cache-Control": "public, max-age=86400"
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
    @CurrentUser() contact: Contact
  ): Promise<{ success: boolean }> {
    try {
      const success = await documentService.deleteDocument(id);
      return { success };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError({ message: "Failed to delete document" });
    }
  }
}
