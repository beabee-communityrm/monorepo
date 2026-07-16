import {
  ALLOWED_IMAGE_MIME_TYPES,
  isSupportedImageType,
} from '@beabee/beabee-common';
import type { UploadFileResponse } from '@beabee/beabee-common';
import { config } from '@beabee/core/config';
import {
  BadRequestError,
  UnauthorizedError,
  UnsupportedFileTypeError,
} from '@beabee/core/errors';
import { Contact } from '@beabee/core/models';
import { imageService } from '@beabee/core/services/ImageService';

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
  UseBefore,
} from 'routing-controllers';
import { pipeline } from 'stream/promises';

import { RateLimit } from '../decorators/index.js';
import { uploadMiddleware } from '../middlewares/index.js';

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
    @CurrentUser({ required: false }) contact?: Contact
  ): Promise<UploadFileResponse> {
    const file = await uploadMiddleware(req);

    if (!file) {
      throw new BadRequestError('No image file provided');
    }

    // Verify file type is allowed before consuming the stream
    if (!isSupportedImageType(file.mimetype)) {
      file.stream.resume(); // Drain the stream so the request completes
      throw new UnsupportedFileTypeError(
        file.mimetype,
        ALLOWED_IMAGE_MIME_TYPES
      );
    }

    // Use the ImageService to upload and process the file
    const metadata = await imageService.uploadImage(
      file.stream,
      file.filename,
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
  ): Promise<Response> {
    // Get the filename first, this also throws if the image doesn't exist
    const metadata = await imageService.getImageMetadata(id);

    // Get image as stream
    const imageData = await imageService.getImageStream(id, width);

    // Set appropriate security headers
    res.set({
      'Content-Type': imageData.contentType,
      'Content-Disposition': `inline; filename="${metadata.filename || id}"`,
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "img-src 'self'",
      'X-Frame-Options': 'SAMEORIGIN',
    });

    // Stream the image to the response
    try {
      await pipeline(imageData.stream, res);
    } catch (error) {
      if (!res.headersSent) {
        throw new BadRequestError(`Failed to stream image (${id})`);
      }
      // Too late for an error response, abort the connection
      res.destroy();
    }

    // Returning the response object tells routing-controllers the response
    // has been handled
    return res;
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
      throw new UnauthorizedError();
    }

    const success = await imageService.deleteImage(id);
    return { success };
  }
}
