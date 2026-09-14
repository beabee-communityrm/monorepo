import {
  ALLOWED_AUDIO_MIME_TYPES,
  isSupportedAudioType,
} from '@beabee/beabee-common';
import type { UploadFileResponse } from '@beabee/beabee-common';
import { Contact } from '@beabee/core/models';
import { AudioMetadata, audioService } from '@beabee/core/services';

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
import { Readable } from 'stream';

import { RateLimit } from '../decorators/index.js';
import { FileController } from './FileController.js';

@JsonController('/audio')
export class AudioController extends FileController<AudioMetadata> {
  protected readonly typeName = 'audio';
  protected readonly pathPrefix = 'audio';
  protected readonly allowedMimeTypes = ALLOWED_AUDIO_MIME_TYPES;
  protected readonly contentSecurityPolicy = "default-src 'self'";

  protected isSupportedType(mimetype: string): boolean {
    return isSupportedAudioType(mimetype);
  }

  protected uploadFile(
    stream: Readable,
    filename: string,
    mimetype: string,
    owner?: string
  ): Promise<AudioMetadata> {
    return audioService.upload(stream, filename, mimetype, owner);
  }

  protected getFileMetadata(id: string): Promise<AudioMetadata> {
    return audioService.getMetadata(id);
  }

  protected getFileStream(id: string) {
    return audioService.getStream(id);
  }

  protected deleteFile(id: string): Promise<boolean> {
    return audioService.delete(id);
  }

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
  upload(
    @Req() req: Request,
    @CurrentUser({ required: false }) contact?: Contact
  ): Promise<UploadFileResponse> {
    return this.handleUpload(req, contact?.email);
  }

  /**
   * Get an audio file
   */
  @Get('/:id')
  get(@Res() res: Response, @Param('id') id: string): Promise<Response> {
    return this.handleGet(res, id);
  }

  /**
   * Delete an audio file
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
