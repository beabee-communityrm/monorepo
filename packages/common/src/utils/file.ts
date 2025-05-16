import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_IMAGE_EXTENSIONS
} from "../constants.js";

/**
 * Check if a MIME type is a supported document type.
 * Example: "application/pdf"
 * @param mimetype MIME type to check
 * @returns True if it's a supported document type
 */
export const isSupportedDocumentType = (mimetype?: string): boolean => {
  if (!mimetype) return false;
  return ALLOWED_DOCUMENT_MIME_TYPES.includes(mimetype.toLowerCase().trim());
};

/**
 * Check if an extension is a supported document extension.
 * Example: "pdf"
 * @param extension Extension to check
 * @returns True if it's a supported document extension
 */
export const isSupportedDocumentExtension = (extension?: string): boolean => {
  if (!extension) return false;
  return ALLOWED_DOCUMENT_EXTENSIONS.includes(extension.toLowerCase().trim());
};

/**
 * Check if a MIME type is a supported image type.
 * Example: "image/jpeg", "image/png", "image/webp", "image/avif"
 * @param mimetype MIME type to check
 * @returns True if it's a supported image type
 */
export const isSupportedImageType = (mimetype?: string): boolean => {
  if (!mimetype) return false;
  return ALLOWED_IMAGE_MIME_TYPES.includes(mimetype.toLowerCase().trim());
};

/**
 * Check if an extension is a supported image extension.
 * Example: "jpg", "png", "webp", "avif"
 * @param extension Extension to check
 * @returns True if it's a supported image extension
 */
export const isSupportedImageExtension = (extension?: string): boolean => {
  if (!extension) return false;
  return ALLOWED_IMAGE_EXTENSIONS.includes(extension.toLowerCase().trim());
};

/**
 * Converts byte size to a human-readable string representation
 *
 * This function takes a size in bytes and converts it to a human-readable
 * format with appropriate units (B, KB, MB, GB, TB). The result is formatted
 * with two decimal places.
 *
 * @param bytes - The file size in bytes to convert
 * @returns A formatted string with size and unit (e.g., "15.50 MB")
 *
 * @example
 * ```ts
 * bytesToHumanReadable(1500000); // "1.43 MB"
 * bytesToHumanReadable(1024);    // "1.00 KB"
 * ```
 */
export const bytesToHumanReadable = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  let value = bytes;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index++;
  }

  return `${value.toFixed(2)} ${units[index]}`;
};
