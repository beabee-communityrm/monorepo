import {
  MAX_FILE_SIZE_IN_BYTES,
  isSupportedImageType,
} from '@beabee/beabee-common';
import type { UploadFileResponse } from '@beabee/beabee-common';
import { config } from '@beabee/core/config';
import { BadRequestError, UnsupportedFileType } from '@beabee/core/errors';
import { Contact } from '@beabee/core/models';
import { imageService } from '@beabee/core/services/ImageService';
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
  QueryParam,
  Req,
  Res,
  UnauthorizedError,
  UseBefore,
} from 'routing-controllers';

import { RateLimit } from '../decorators';
import { uploadMiddleware } from '../middlewares';

@JsonController('/images')
export class ImageController {
  /**
   * Upload a new image
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
      throw new BadRequestError({ message: 'No image file provided' });
    }

    // Verify file type is allowed - multer handles size but we still check type
    if (!isSupportedImageType(req.file.mimetype)) {
      throw new UnsupportedFileType({
        message: `Unsupported image type ${req.file.mimetype}. Please upload a JPEG, PNG, WebP or AVIF image.`,
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
      hash: metadata.hash,
    };

    // Only add filename if it exists
    if (metadata.filename) {
      response.filename = metadata.filename;
    }

    return response;
  }

  /**
   * Get an image with optional resizing
   */
  @Get('/:id')
  async getImage(
    @Res() res: Response,
    @Param('id') id: string,
    @QueryParam('w', { required: false }) width?: number
  ): Promise<Buffer> {
    // First get image metadata to check if it exists and get filename
    // This avoids duplicate existence checks in getImageBuffer
    const metadata = await imageService.getImageMetadata(id);

    // Get image as buffer
    const imageData = await imageService.getImageBuffer(id, width);

    // Set appropriate security headers
    res.set({
      'Content-Type': imageData.contentType,
      'Content-Disposition': `inline; filename="${metadata.filename || id}"`,
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "img-src 'self'",
      'X-Frame-Options': 'SAMEORIGIN',
    });

    // Return the buffer, routing-controllers will handle the rest
    return imageData.buffer;
  }

  /**
   * Delete an image
   */
  @Delete('/:id')
  @Authorized()
  async deleteImage(
    @Param('id') id: string,
    @CurrentUser({ required: true }) contact: Contact
  ): Promise<{ success: boolean }> {
    // Get image metadata first to check ownership
    const metadata = await imageService.getImageMetadata(id);

    // Check if user is the owner of the image or an admin
    if (
      metadata.owner &&
      metadata.owner !== contact.email &&
      !contact.hasRole('admin')
    ) {
      throw new UnauthorizedError(
        "You don't have permission to delete this image"
      );
    }

    const success = await imageService.deleteImage(id);
    return { success };
  }
}
