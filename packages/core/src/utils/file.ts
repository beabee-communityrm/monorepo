/**
 * Get MIME type from file extension
 * @param extension File extension
 * @private
 */
export const getMimetypeFromExtension = (extension: string): string => {
  const ext = extension.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
};

/**
 * Get file extension from MIME type
 * @param mimetype MIME type
 * @private
 */
export const getExtensionFromMimetype = (mimetype?: string): string => {
  if (!mimetype) return "bin";

  const mime = mimetype.toLowerCase();
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
};
