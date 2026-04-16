import { MAX_FILE_SIZE_IN_BYTES } from '@beabee/beabee-common';

import { MulterError } from 'multer';
import { HttpError } from 'routing-controllers';

import {
  BadRequestError,
  FileTooLargeError,
  FileUploadError,
  UnsupportedFileTypeError,
} from '../errors';

/**
 * Converts multer upload errors into appropriate HTTP error responses
 *
 * This utility function transforms Multer's file upload errors into appropriate
 * HTTP error responses with standardized status codes and meaningful messages.
 * It maps different error codes to specific error types:
 * - LIMIT_FILE_SIZE → FileTooLargeError (HTTP 413)
 * - LIMIT_UNEXPECTED_FILE → UnsupportedFileType (HTTP 415)
 * - Other limits → BadRequestError (HTTP 400) with specific error codes
 *
 * @param error - The error object thrown during file upload (usually from multer middleware)
 * @returns An appropriate HttpError with status code and message based on the error type
 *
 * @example
 * ```ts
 * try {
 *   await uploadMiddleware(req, res);
 * } catch (error) {
 *   throw convertMulterError(error, 20 * 1024 * 1024); // 20MB
 * }
 * ```
 */
export function convertMulterError(error: unknown): HttpError {
  const message = error instanceof Error ? error.message : 'Unknown error';

  // If it's not a MulterError, return a generic BadRequestError
  if (!(error instanceof MulterError)) {
    return new BadRequestError(`Upload error: ${message}`);
  }

  // Handle specific MulterError codes
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return new FileTooLargeError(MAX_FILE_SIZE_IN_BYTES);

    case 'LIMIT_UNEXPECTED_FILE':
      return new UnsupportedFileTypeError(error.field || 'unknown');

    case 'LIMIT_FILE_COUNT':
      return new FileUploadError(
        'TOO_MANY_FILES',
        `Too many files uploaded: ${message}`
      );

    case 'LIMIT_PART_COUNT':
      return new FileUploadError(
        'TOO_MANY_PARTS',
        `Too many parts in multipart form: ${message}`
      );

    case 'LIMIT_FIELD_KEY':
      return new FileUploadError(
        'FIELD_KEY_TOO_LONG',
        `Field name too long: ${message}`
      );

    case 'LIMIT_FIELD_VALUE':
      return new FileUploadError(
        'FIELD_VALUE_TOO_LONG',
        `Field value too long: ${message}`
      );

    case 'LIMIT_FIELD_COUNT':
      return new FileUploadError(
        'TOO_MANY_FIELDS',
        `Too many fields in form: ${message}`
      );

    default:
      return new FileUploadError('UPLOAD_ERROR', `Upload error: ${message}`);
  }
}
