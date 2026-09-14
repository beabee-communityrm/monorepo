import {
  ALLOWED_IMAGE_MIME_TYPES,
  isSupportedImageType,
} from '@beabee/beabee-common';
import type { UploadFileResponse } from '@beabee/beabee-common';
import { Contact } from '@beabee/core/models';
import { imageService } from '@beabee/core/services';
import type { ImageMetadata } from '@beabee/core/type';

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
import { Readable } from 'stream';

import { RateLimit } from '../decorators/index.js';
import { FileController } from './FileController.js';

@JsonController('/images')
export class ImageController extends FileController<ImageMetadata> {
  protected readonly typeName = 'image';
  protected readonly pathPrefix = 'images';
  protected readonly allowedMimeTypes = ALLOWED_IMAGE_MIME_TYPES;
  protected readonly contentSecurityPolicy = "img-src 'self'";

  protected isSupportedType = isSupportedImageType;
  // uploadImage doesn't take a mimetype - it detects the format itself
  protected uploadFile = (
    stream: Readable,
    filename: string,
    _mimetype: string,
    owner?: string
  ) => imageService.uploadImage(stream, filename, owner);
  protected getFileMetadata = imageService.getImageMetadata.bind(imageService);
  protected getFileStream = imageService.getImageStream.bind(imageService);
  protected deleteFile = imageService.deleteImage.bind(imageService);

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
  upload(
    @Req() req: Request,
    @CurrentUser({ required: false }) contact?: Contact
  ): Promise<UploadFileResponse> {
    return this.handleUpload(req, contact?.email);
  }

  /**
   * Get an image with optional resizing
   */
  @Get('/:id')
  get(
    @Res() res: Response,
    @Param('id') id: string,
    @QueryParam('w', { required: false }) width?: number
  ): Promise<Response> {
    return this.handleGet(res, id, width);
  }

  /**
   * Delete an image
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
