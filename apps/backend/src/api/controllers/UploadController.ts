import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import {
  CurrentUser,
  Get,
  JsonController,
  NotFoundError,
  OnUndefined,
  Params,
  Post,
  QueryParam,
  Req,
  Res,
  UploadedFile,
  BadRequestError as RoutingBadRequestError
} from "routing-controllers";

import { uploadFlowService } from "@beabee/core/services/UploadFlowService";
import { imageService } from "@beabee/core/services/ImageService";

import { Contact } from "@beabee/core/models";

import { FileUploadResultDto, GetUploadFlowDto } from "@api/dto/UploadFlowDto";
import { BadRequestError } from "@beabee/core/errors";
import { UUIDParams } from "@api/params/UUIDParams";

// Define interface for file upload
interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@JsonController("/upload")
export class UploadController {
  @Post("/")
  async createUploadFlow(
    @CurrentUser({ required: false }) contact: Contact | undefined,
    @Req() req: Request
  ): Promise<GetUploadFlowDto> {
    if (!req.ip) {
      throw new BadRequestError();
    }

    const newUploadFlowId = await uploadFlowService.create(contact, req.ip);
    return plainToInstance(GetUploadFlowDto, { id: newUploadFlowId });
  }

  /**
   * Uploads a file to storage (supports images, PDFs and other file types)
   * For images, additional resized versions are automatically created
   */
  @Post("/file")
  async uploadFile(
    @UploadedFile("file") file: UploadedFile,
    @Req() req: Request
  ): Promise<FileUploadResultDto> {
    if (!req.query.token || typeof req.query.token !== "string") {
      throw new RoutingBadRequestError("Missing or invalid upload token");
    }

    // Validate the upload flow
    const isValid = await uploadFlowService.validate(req.query.token);
    if (!isValid) {
      throw new NotFoundError("Invalid or expired upload token");
    }

    // Check file size (20MB limit)
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    if (file.size >= MAX_FILE_SIZE) {
      throw new RoutingBadRequestError("File too large");
    }

    try {
      // Upload the file using ImageService
      const urls = await imageService.uploadFile(
        file.buffer,
        file.originalname
      );

      // Return the primary URL and all size variants
      return plainToInstance(FileUploadResultDto, {
        url: urls.original,
        urls
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new RoutingBadRequestError("Failed to upload file");
    }
  }

  /**
   * Retrieves any file with optional resizing for images
   * Supports various file types including PDFs, images, documents, etc.
   * Image files can be resized on the fly using w and h parameters
   */
  @Get("/file/:filename")
  async getFile(
    @Res() response: Response,
    @Params() { filename }: { filename: string },
    @QueryParam("w") width?: string,
    @QueryParam("h") height?: string
  ): Promise<void> {
    try {
      // Validate parameters
      const targetWidth = width ? parseInt(width, 10) : undefined;
      const targetHeight = height ? parseInt(height, 10) : undefined;

      if ((width && isNaN(targetWidth!)) || (height && isNaN(targetHeight!))) {
        throw new RoutingBadRequestError("Invalid width or height parameters");
      }

      // Use the streamFile method from ImageService which handles all file types
      // and automatically selects the best approach for streaming and resizing
      await imageService.streamFile(
        filename,
        {
          width: targetWidth,
          height: targetHeight
        },
        response
      );
    } catch (error) {
      console.error("Error getting file:", error);
      throw new NotFoundError("File not found");
    }
  }

  // This should be a POST request as it's not idempotent, but we use nginx's
  // auth_request directive to call this endpoint and it only does GET requests
  @Get("/:id")
  @OnUndefined(204)
  async get(@Params() { id }: UUIDParams): Promise<void> {
    if (!(await uploadFlowService.validate(id))) {
      throw new NotFoundError();
    }
  }
}
