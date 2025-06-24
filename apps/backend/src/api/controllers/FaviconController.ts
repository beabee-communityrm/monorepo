import { faviconService } from '@beabee/core/services';

import { Response } from 'express';
import { Get, JsonController, Param, Res } from 'routing-controllers';

@JsonController()
export class FaviconController {
  /**
   * Get favicon.ico
   */
  @Get('/favicon.ico')
  async getFaviconIco(@Res() res: Response): Promise<Buffer> {
    const faviconData = await faviconService.getFaviconIco();

    res.set({
      'Content-Type': faviconData.contentType,
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
    });

    return faviconData.buffer;
  }

  /**
   * Get favicon PNG files
   */
  @Get(
    '/:filename(favicon-16x16\\.png|favicon-32x32\\.png|apple-touch-icon\\.png|android-chrome-192x192\\.png|android-chrome-512x512\\.png)'
  )
  async getFaviconPng(
    @Param('filename') filename: string,
    @Res() res: Response
  ): Promise<Buffer> {
    const faviconData = await faviconService.getFaviconImage(filename);

    res.set({
      'Content-Type': faviconData.contentType,
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
    });

    return faviconData.buffer;
  }

  /**
   * Get web app manifest
   */
  @Get('/site.webmanifest')
  async getWebAppManifest(@Res() res: Response): Promise<object> {
    const manifest = await faviconService.getWebAppManifest();

    res.set({
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=86400',
    });

    return manifest;
  }
}
