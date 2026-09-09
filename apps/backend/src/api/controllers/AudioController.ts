import {
  ALLOWED_AUDIO_MIME_TYPES,
  isSupportedAudioType,
} from '@beabee/beabee-common';
import type { UploadFileResponse } from '@beabee/beabee-common';
import { config } from '@beabee/core/config';
import {
  BadRequestError,
  UnauthorizedError,
  UnsupportedFileTypeError,
} from '@beabee/core/errors';
import { Contact } from '@beabee/core/models';
import { audioService } from '@beabee/core/services';

import { Request, Response } from 'express';
import {
  Authorized,
  CurrentUser,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Req,
  Res,
  UseBefore,
} from 'routing-controllers';
import { pipeline } from 'stream/promises';

import { RateLimit } from '../decorators/index.js';
import { uploadMiddleware } from '../middlewares/index.js';

@JsonController('/audio')
export class AudioController {
  /**
   * Upload a new audio file
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
      throw new BadRequestError('No audio file provided');
    }

    // Verify file type is allowed before consuming the stream
    if (!isSupportedAudioType(file.mimetype)) {
      file.stream.resume(); // Drain the stream so the request completes
      throw new UnsupportedFileTypeError(
        file.mimetype,
        ALLOWED_AUDIO_MIME_TYPES
      );
    }

    // Use the AudioService to upload the file with owner information
    const metadata = await audioService.uploadAudio(
      file.stream,
      file.filename,
      file.mimetype,
      contact?.email // Add the owner information if available
    );

    const path = `audio/${metadata.id}`;

    // Create response object
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
   * Get an audio file
   */
  @Get('/:id')
  async getAudio(
    @Res() res: Response,
    @Param('id') id: string
  ): Promise<Response> {
    // Get the filename first, this also throws if the audio file doesn't exist
    const metadata = await audioService.getAudioMetadata(id);

    // Get audio as stream
    const audioData = await audioService.getAudioStream(id);

    // Set appropriate security headers
    res.set({
      'Content-Type': audioData.contentType,
      'Content-Disposition': `inline; filename="${metadata.filename || id}"`,
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'",
      'X-Frame-Options': 'SAMEORIGIN',
    });

    // Stream the audio file to the response
    try {
      await pipeline(audioData.stream, res);
    } catch (error) {
      if (!res.headersSent) {
        throw new BadRequestError(`Failed to stream audio (${id})`);
      }
      // Too late for an error response, abort the connection
      res.destroy();
    }

    // Returning the response object tells routing-controllers the response
    // has been handled
    return res;
  }

  /**
   * Delete an audio file
   */
  @Delete('/:id')
  @Authorized()
  async deleteAudio(
    @Param('id') id: string,
    @CurrentUser({ required: true }) contact: Contact
  ): Promise<{ success: boolean }> {
    // Get audio metadata first to check ownership
    const metadata = await audioService.getAudioMetadata(id);

    // Check if the user is the owner of the audio file
    // Only allow the audio owner or admins to delete audio files
    if (
      metadata.owner &&
      metadata.owner !== contact.email &&
      !contact.hasRole('admin')
    ) {
      throw new UnauthorizedError();
    }

    const success = await audioService.deleteAudio(id);
    return { success };
  }
}
