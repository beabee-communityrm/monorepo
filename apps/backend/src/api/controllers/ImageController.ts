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
  Res
} from "routing-controllers";
import { MulterError } from "multer";

import { imageService } from "@beabee/core/services/ImageService";
import { Contact } from "@beabee/core/models";
import { BadRequestError } from "@beabee/core/errors";
import UploadFlowService from "@beabee/core/services/UploadFlowService";
import { uploadMiddleware } from "../middlewares";
import { config } from "@beabee/core/config";

import type { UploadFileResponse } from "@beabee/beabee-common";

@JsonController("/images")
export class ImageController {
  /**
   * Upload a new image
   */
  @Post("/")
  async upload(
    @CurrentUser({ required: false }) contact: Contact | undefined,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<UploadFileResponse> {
    // Validate upload flow token if provided
    const token = req.query.token as string;
    if (token) {
      if (!(await UploadFlowService.validate(token))) {
        throw new NotFoundError("Invalid upload token");
      }
    } else if (!contact) {
      // If no token and not authenticated, reject
      throw new BadRequestError({ message: "Authentication required" });
    }

    try {
      // Apply multer middleware to handle file upload
      await uploadMiddleware(req, res);

      if (!req.file) {
        throw new BadRequestError({ message: "No image file provided" });
      }

      // Use the ImageService to upload and process the file
      const metadata = await imageService.uploadImage(
        req.file.buffer
        // req.file.originalname,
        // req.file.mimetype
      );

      return {
        id: metadata.id,
        // url: `${config.audience}/uploads/${metadata.id}`,
        url: `${config.audience}/api/1.0/images/${metadata.id}`
      };
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

      throw new BadRequestError({ message: "Failed to upload image" });
    }
  }

  @Get("/debug")
  async debugConnection(): Promise<any> {
    const connected = await imageService.checkConnection();
    const images = await imageService.listImages();

    return {
      connected,
      imageCount: images.length,
      sampleImages: images.slice(images.length - 5)
    };
  }

  /**
   * Get an image with optional resizing
   */
  @Get("/:id")
  async getImage(
    @Res() res: Response,
    @Param("id") id: string,
    @QueryParam("w") width?: number
  ): Promise<Buffer> {
    try {
      // Get image as buffer
      const imageData = await imageService.getImageBuffer(id, width);

      // Set headers but don't end the response (thanks to passthrough)
      res.set({
        "Content-Type": imageData.contentType,
        "Cache-Control": "public, max-age=86400"
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
    @CurrentUser() contact: Contact
  ): Promise<{ success: boolean }> {
    try {
      const success = await imageService.deleteImage(id);
      return { success };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError({ message: "Failed to delete image" });
    }
  }
}
