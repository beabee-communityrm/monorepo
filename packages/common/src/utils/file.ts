/**
 * Check if a MIME type is a supported document type
 * @param mimetype MIME type to check
 * @returns True if it's a supported document type
 */
export const isSupportedDocumentType = (mimetype?: string): boolean => {
  if (!mimetype) return false;

  const supportedTypes = ["application/pdf"];

  return supportedTypes.includes(mimetype.toLowerCase());
};

/**
 * Check if a MIME type is a supported image type
 * @param mimetype MIME type to check
 * @returns True if it's a supported image type
 */
export const isSupportedImageType = (mimetype?: string): boolean => {
  if (!mimetype) return false;

  const supportedTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/avif"
  ];

  return supportedTypes.includes(mimetype.toLowerCase());
};
