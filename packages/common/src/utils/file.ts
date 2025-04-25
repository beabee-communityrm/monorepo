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
