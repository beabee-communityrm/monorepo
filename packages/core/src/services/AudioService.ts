import { ALLOWED_AUDIO_MIME_TYPES } from '@beabee/beabee-common';

import config from '../config/config.js';
import type { FileMetadata } from '../type/index.js';
import { BaseFileService } from './BaseFileService.js';

export type AudioMetadata = FileMetadata;

/**
 * Service for handling audio uploads and storage in S3/MinIO
 */
export class AudioService extends BaseFileService<AudioMetadata> {
  protected readonly keyPrefix = 'audio';
  protected readonly typeName = 'audio';
  protected readonly loggerName = 'audio-service';
  readonly allowedMimeTypes = ALLOWED_AUDIO_MIME_TYPES;
  protected readonly defaultMimetype = 'audio/webm';
}

export const audioService = new AudioService(config.audio);
