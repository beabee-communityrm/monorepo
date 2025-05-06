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
  QueryParam,
  Req,
  Res,
  UnauthorizedError,
  UseBefore
} from "routing-controllers";
import { MulterError } from "multer";

import { imageService } from "@beabee/core/services/ImageService";
import { Contact } from "@beabee/core/models";
import { BadRequestError } from "@beabee/core/errors";
import { uploadMiddleware } from "../middlewares";
import { config } from "@beabee/core/config";
import { isSupportedImageType } from "@beabee/beabee-common";
import { RateLimit } from "../decorators";
import { UnsupportedFileType } from "@beabee/core/errors";

import type { UploadFileResponse } from "@beabee/beabee-common";

@JsonController("/images")
export class ImageController {
  /**
   * Upload a new image
   */
  @Post("/")
  @Authorized()
  @UseBefore(
    RateLimit({
      guest: { points: 5, duration: 60 * 60 },
      user: { points: 50, duration: 60 * 60 }
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

      if (!req.file) {
        throw new BadRequestError({ message: "No image file provided" });
      }

      // Verify file type is allowed - multer handles size but we still check type
      if (!isSupportedImageType(req.file.mimetype)) {
        throw new UnsupportedFileType({
          message: `Unsupported image type ${req.file.mimetype}. Please upload a JPEG, PNG, WebP or AVIF image.`
        });
      }

      // Use the ImageService to upload and process the file
      const metadata = await imageService.uploadImage(
        req.file.buffer,
        req.file.originalname,
        contact?.email // Only add owner information if available
      );

      const path = `images/${metadata.id}`;

      const response: UploadFileResponse = {
        id: metadata.id,
        url: `${config.audience}/api/1.0/${path}`,
        path,
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

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      throw new BadRequestError({
        message: "Failed to upload image: " + errorMessage
      });
    }
  }

  /**
   * Get an image with optional resizing
   */
  @Get("/:id")
  async getImage(
    @Res() res: Response,
    @Param("id") id: string,
    @QueryParam("w", { required: false }) width?: number
  ): Promise<Buffer> {
    try {
      // Get image as buffer
      const imageData = await imageService.getImageBuffer(id, width);

      // Get image metadata to check permissions if needed in the future
      const metadata = await imageService.getImageMetadata(id);

      // Set appropriate security headers
      res.set({
        "Content-Type": imageData.contentType,
        "Content-Disposition": `inline; filename="${metadata.filename || id}"`,
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "img-src 'self'",
        "X-Frame-Options": "SAMEORIGIN"
      });

      // Return the buffer, routing-controllers will handle the rest
      return imageData.buffer;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundError("Image not found");
      }
      console.error("Error retrieving image:", error);
      throw new BadRequestError({ message: "Failed to retrieve image" });
    }
  }

  /**
   * Delete an image
   */
  @Delete("/:id")
  @Authorized()
  async deleteImage(
    @Param("id") id: string,
    @CurrentUser({ required: true }) contact: Contact
  ): Promise<{ success: boolean }> {
    try {
      // Get image metadata first to check ownership
      const metadata = await imageService.getImageMetadata(id);

      // Check if user is the owner of the image or an admin
      if (
        metadata.owner &&
        metadata.owner !== contact.email &&
        !contact.hasRole("admin")
      ) {
        throw new UnauthorizedError(
          "You don't have permission to delete this image"
        );
      }

      const success = await imageService.deleteImage(id);
      return { success };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new BadRequestError({ message: "Failed to delete image" });
    }
  }
}
