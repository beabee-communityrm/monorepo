import { MAX_FILE_SIZE_IN_BYTES } from '@beabee/beabee-common';
import { BadRequestError, FileTooLargeError } from '@beabee/core/errors';

import busboy from 'busboy';
import { Request } from 'express';

import type { UploadedFile } from '#type/index';

/**
 * Parse a multipart/form-data request and resolve with the uploaded file as
 * a stream as soon as it arrives, without buffering it in memory.
 *
 * If the file exceeds the size limit its stream is destroyed with a
 * FileTooLargeError, which surfaces wherever the stream is consumed.
 *
 * @param req The incoming request
 * @returns The uploaded file, or undefined if the request contains no file
 */
export function uploadMiddleware(
  req: Request
): Promise<UploadedFile | undefined> {
  return new Promise((resolve, reject) => {
    const bb = busboy({
      headers: req.headers,
      limits: { fileSize: MAX_FILE_SIZE_IN_BYTES, files: 1 },
    });

    bb.on('file', (name, file, info) => {
      if (name !== 'file') {
        file.resume();
        return;
      }

      file.on('limit', () => {
        file.destroy(new FileTooLargeError(MAX_FILE_SIZE_IN_BYTES));
      });

      resolve({
        stream: file,
        filename: info.filename,
        mimetype: info.mimeType,
      });
    });

    // No-ops if a file already resolved the promise
    bb.on('close', () => resolve(undefined));
    bb.on('error', (error) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      reject(new BadRequestError(`Upload error: ${message}`));
    });

    req.pipe(bb);
  });
}
