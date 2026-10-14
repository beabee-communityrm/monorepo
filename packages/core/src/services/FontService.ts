import {
  ALLOWED_FONT_MIME_TYPES,
  MAX_FONT_SIZE_IN_BYTES,
} from '@beabee/beabee-common';

import { Readable } from 'stream';

import config from '../config/config.js';
import { BadRequestError, FileTooLargeError } from '../errors/index.js';
import type { FileMetadata } from '../type/index.js';
import { peekStreamBytes } from '../utils/file.js';
import { BaseFileService } from './BaseFileService.js';

export type FontMetadata = FileMetadata;

/**
 * Service for handling theme font uploads and storage in S3/MinIO. The fonts
 * are served to pages rendered outside the frontend and pushed to the
 * identity provider.
 */
export class FontService extends BaseFileService<FontMetadata> {
  protected readonly keyPrefix = 'fonts';
  protected readonly typeName = 'font';
  protected readonly loggerName = 'font-service';
  readonly allowedMimeTypes = ALLOWED_FONT_MIME_TYPES;
  protected readonly defaultMimetype = 'font/woff2';

  /** WOFF2 signature check */
  protected override async validateContent(data: Readable): Promise<void> {
    const signature = await peekStreamBytes(data, 4);
    if (signature.toString('ascii') !== 'wOF2') {
      throw new BadRequestError('Invalid WOFF2 font file');
    }
  }

  /** The identity provider rejects larger font files, so neither are kept */
  override async upload(
    ...args: Parameters<BaseFileService<FontMetadata>['upload']>
  ): Promise<FontMetadata> {
    const metadata = await super.upload(...args);
    if (metadata.size > MAX_FONT_SIZE_IN_BYTES) {
      await this.delete(metadata.id);
      throw new FileTooLargeError(MAX_FONT_SIZE_IN_BYTES);
    }
    return metadata;
  }
}

export const fontService = new FontService(config.font);
