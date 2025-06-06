import { MulterError } from 'multer';
import { HttpError } from 'routing-controllers';
import { bytesToHumanReadable } from '@beabee/beabee-common';
import {
  BadRequestError,
  FileTooLargeError,
  UnsupportedFileType,
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
 * @param maxFileSizeBytes - The maximum file size in bytes. If provided, this will be
 *                          included in the error message for size limit errors
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
export function convertMulterError(
  error: unknown,
  maxFileSizeBytes?: number
): HttpError {
  const message = error instanceof Error ? error.message : 'Unknown error';

  // Format max file size for display if provided
  const sizeDisplay = maxFileSizeBytes
    ? bytesToHumanReadable(maxFileSizeBytes)
    : undefined;

  // If it's not a MulterError, return a generic BadRequestError
  if (!(error instanceof MulterError)) {
    return new BadRequestError({
      message: `Upload error: ${message}`,
      code: 'UPLOAD_ERROR',
    });
  }

  // Handle specific MulterError codes
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return new FileTooLargeError({
        message: `File too large: ${message}`,
        ...(sizeDisplay ? { maxSize: sizeDisplay } : {}),
      });

    case 'LIMIT_UNEXPECTED_FILE':
      return new UnsupportedFileType({
        message: `Unexpected file: ${error.field || 'unknown field'}: ${message}`,
      });

    case 'LIMIT_FILE_COUNT':
      return new BadRequestError({
        message: `Too many files uploaded: ${message}`,
        code: 'TOO_MANY_FILES',
      });

    case 'LIMIT_PART_COUNT':
      return new BadRequestError({
        message: `Too many parts in multipart form: ${message}`,
        code: 'TOO_MANY_PARTS',
      });

    case 'LIMIT_FIELD_KEY':
      return new BadRequestError({
        message: `Field name too long: ${message}`,
        code: 'FIELD_KEY_TOO_LONG',
      });

    case 'LIMIT_FIELD_VALUE':
      return new BadRequestError({
        message: `Field value too long: ${message}`,
        code: 'FIELD_VALUE_TOO_LONG',
      });

    case 'LIMIT_FIELD_COUNT':
      return new BadRequestError({
        message: `Too many fields in form: ${message}`,
        code: 'TOO_MANY_FIELDS',
      });

    default:
      return new BadRequestError({
        message: `Upload error: ${message}`,
        code: 'UPLOAD_ERROR',
      });
  }
}
