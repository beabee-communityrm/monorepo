import type { UploadFileResponse } from '@beabee/beabee-common';
import { config } from '@beabee/core/config';
import { BadRequestError, UnsupportedFileTypeError } from '@beabee/core/errors';
import { fontService } from '@beabee/core/services';

import { Request, Response } from 'express';
import {
  Authorized,
  Get,
  JsonController,
  Param,
  Post,
  Req,
  Res,
} from 'routing-controllers';
import { pipeline } from 'stream/promises';

import { uploadMiddleware } from '../middlewares/index.js';

@JsonController('/fonts')
export class FontController {
  /**
   * Upload a theme font
   */
  @Post('/')
  @Authorized('admin')
  async upload(@Req() req: Request): Promise<UploadFileResponse> {
    const file = await uploadMiddleware(req);

    if (!file) {
      throw new BadRequestError('No font file provided');
    }

    // Verify file type is allowed before consuming the stream
    if (!fontService.isSupportedType(file.mimetype)) {
      file.stream.resume(); // Drain the stream so the request completes
      throw new UnsupportedFileTypeError(
        file.mimetype,
        fontService.allowedMimeTypes
      );
    }

    const metadata = await fontService.upload(
      file.stream,
      file.filename,
      file.mimetype
    );
    const path = `fonts/${metadata.id}`;

    return {
      id: metadata.id,
      url: `${config.audience}/api/1.0/${path}`,
      path,
      hash: metadata.hash,
    };
  }

  /**
   * Get a theme font
   */
  @Get('/:id')
  async getFont(
    @Res() res: Response,
    @Param('id') id: string
  ): Promise<Response> {
    const fontData = await fontService.getStream(id);

    res.set({
      'Content-Type': fontData.contentType,
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      // Fonts are fetched cross-origin, e.g. by the payment form's iframe
      'Access-Control-Allow-Origin': '*',
    });

    try {
      await pipeline(fontData.stream, res);
    } catch (error) {
      if (!res.headersSent) {
        throw new BadRequestError(`Failed to stream font (${id})`);
      }
      // Too late for an error response, abort the connection
      res.destroy();
    }

    // Returning the response object tells routing-controllers the response
    // has been handled
    return res;
  }
}
