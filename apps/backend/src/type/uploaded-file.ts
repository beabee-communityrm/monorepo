import { Readable } from 'stream';

/**
 * A file uploaded via a multipart/form-data request, exposed as a stream so
 * it can be processed without buffering it in memory
 */
export interface UploadedFile {
  stream: Readable;
  filename: string;
  mimetype: string;
}
