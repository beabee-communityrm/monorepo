import {
  ALLOWED_AUDIO_MIME_TYPES,
  isSupportedAudioType,
} from '@beabee/beabee-common';

import config from '../config/config.js';
import type { FileMetadata } from '../type/index.js';
import { FileService } from './FileService.js';

export type AudioMetadata = FileMetadata;

/**
 * Service for handling audio uploads and storage in S3/MinIO
 */
export class AudioService extends FileService<AudioMetadata> {
  protected readonly keyPrefix = 'audio';
  protected readonly typeName = 'audio';
  protected readonly loggerName = 'audio-service';
  protected readonly allowedMimeTypes = ALLOWED_AUDIO_MIME_TYPES;
  protected readonly defaultMimetype = 'audio/webm';

  protected isSupportedType(mimetype: string): boolean {
    return isSupportedAudioType(mimetype);
  }

  // Existing public API, kept unchanged for callers - delegates to the
  // shared FileService implementation.
  uploadAudio = this.upload.bind(this);
  getAudioStream = this.getStream.bind(this);
  getAudioBuffer = this.getBuffer.bind(this);
  deleteAudio = this.delete.bind(this);
  getAudioMetadata = this.getMetadata.bind(this);
  getAudioHash = this.getHash.bind(this);
  audioExists = this.exists.bind(this);
  listAudio = this.list.bind(this);
}

export const audioService = new AudioService(config.audio);
