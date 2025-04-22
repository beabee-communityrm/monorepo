import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES
} from "../constants.js";

/**
 * Check if a MIME type is a supported document type
 * @param mimetype MIME type to check
 * @returns True if it's a supported document type
 */
export const isSupportedDocumentType = (mimetype?: string): boolean => {
  if (!mimetype) return false;
  return ALLOWED_DOCUMENT_MIME_TYPES.includes(mimetype.toLowerCase());
};

/**
 * Check if a MIME type is a supported image type
 * @param mimetype MIME type to check
 * @returns True if it's a supported image type
 */
export const isSupportedImageType = (mimetype?: string): boolean => {
  if (!mimetype) return false;
  return ALLOWED_IMAGE_MIME_TYPES.includes(mimetype.toLowerCase());
};
