import {
  ALLOWED_AUDIO_MIME_TYPES,
  isSupportedAudioType,
} from '@beabee/beabee-common';

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
  protected readonly allowedMimeTypes = ALLOWED_AUDIO_MIME_TYPES;
  protected readonly defaultMimetype = 'audio/webm';

  protected isSupportedType(mimetype: string): boolean {
    return isSupportedAudioType(mimetype);
  }
}

export const audioService = new AudioService(config.audio);
