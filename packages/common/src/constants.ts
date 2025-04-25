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
 * A list of all image formats that are supported by the sharp-module and our ImageService
 * @constant
 * @name ALLOWED_IMAGE_EXTENSIONS
 * @summary Allowed image formats for upload (input formats)
 */
export const ALLOWED_IMAGE_EXTENSIONS: string[] = [
  "jpeg",
  "jpg",
  "png",
  "webp",
  "gif",
  "avif",
  "svg", // SVG vector graphics
  "tiff",
  "tif", // TIFF-Formate
  "heif",
  "heic", // High Efficiency Image Format (Apple Photos)
  "jp2" // JPEG 2000
];

/**
 * A list of all MIME types that are supported by the sharp-module and our ImageService
 * @constant
 * @name ALLOWED_IMAGE_MIME_TYPES
 * @summary Allowed MIME types
 */
export const ALLOWED_IMAGE_MIME_TYPES: string[] = [
  "image/jpeg",
  "image/jpg", // Fallback for JPEG which is not standardized
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml", // SVG is supported, also for scaling and converting
  "image/tiff", // TIFF is supported by the sharp-module
  "image/heif", // HEIF/HEIC for High Efficiency Image Format
  "image/jp2" // JPEG 2000
];

/**
 * A list of all document formats that are supported by our DocumentService
 * @constant
 * @name ALLOWED_DOCUMENT_EXTENSIONS
 * @summary Allowed document formats for upload (input formats)
 */
export const ALLOWED_DOCUMENT_EXTENSIONS: string[] = ["pdf"];

/**
 * A list of all MIME types that are supported by our DocumentService
 * @constant
 * @name ALLOWED_DOCUMENT_MIME_TYPES
 * @summary Allowed MIME types
 */
export const ALLOWED_DOCUMENT_MIME_TYPES: string[] = ["application/pdf"];
