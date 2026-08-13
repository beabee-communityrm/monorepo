import { BadRequestError } from '@beabee/core/errors';
import { legacyImageService } from '@beabee/core/services/LegacyImageService';

import { Response } from 'express';
import { Get, JsonController, Param, Res } from 'routing-controllers';
import { pipeline } from 'stream/promises';

/**
 * Serves legacy `/uploads` images that were mirrored into S3. The router
 * proxies old URLs here, see the `/uploads` location in the router's
 * nginx.conf.
 */
@JsonController('/legacy-images')
export class LegacyImageController {
  /**
   * Get a legacy image
   */
  @Get('/:filename')
  async getImage(
    @Res() res: Response,
    @Param('filename') filename: string
  ): Promise<Response> {
    const imageData = await legacyImageService.getLegacyImageStream(filename);

    res.set({
      'Content-Type': imageData.contentType,
      'Content-Disposition': `inline; filename="${filename}"`,
      // Legacy images never change
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "img-src 'self'",
      'X-Frame-Options': 'SAMEORIGIN',
    });

    // Stream the image to the response
    try {
      await pipeline(imageData.stream, res);
    } catch (error) {
      if (!res.headersSent) {
        throw new BadRequestError(
          `Failed to stream legacy image (${filename})`
        );
      }
      // Too late for an error response, abort the connection
      res.destroy();
    }

    // Returning the response object tells routing-controllers the response
    // has been handled
    return res;
  }
}
