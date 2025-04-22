/**
 * @constant
 * @name MILLISECONDS_IN_HOUR
 * @summary Milliseconds in 1 hour
 */
export const MILLISECONDS_IN_HOUR: number = 3600000;

/**
 * @constant
 * @name MILLISECONDS_IN_MINUTE
 * @summary Milliseconds in 1 minute
 */
export const MILLISECONDS_IN_MINUTE: number = 60000;

/**
 * @constant
 * @name MAX_FILE_SIZE_IN_BYTES
 * @summary Maximum file size in bytes
 */
export const MAX_FILE_SIZE_IN_BYTES: number = 20 * 1024 * 1024; // 20 MB = 20.971.520 bytes

/**
 * @constant
 * @name ALLOWED_IMAGE_INPUT_FORMATS
 * @summary Allowed image formats for upload (input formats)
 */
export const ALLOWED_IMAGE_INPUT_FORMATS: string[] = [
  "jpeg",
  "jpg",
  "png",
  "webp",
  "gif",
  "avif"
];

/**
 * @constant
 * @name ALLOWED_IMAGE_MIME_TYPES
 * @summary Allowed MIME types
 */
export const ALLOWED_IMAGE_MIME_TYPES: string[] = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif"
];

/**
 * @constant
 * @name ALLOWED_DOCUMENT_INPUT_FORMATS
 * @summary Allowed document formats for upload (input formats)
 */
export const ALLOWED_DOCUMENT_INPUT_FORMATS: string[] = ["pdf"];

/**
 * @constant
 * @name ALLOWED_DOCUMENT_MIME_TYPES
 * @summary Allowed MIME types
 */
export const ALLOWED_DOCUMENT_MIME_TYPES: string[] = ["application/pdf"];
