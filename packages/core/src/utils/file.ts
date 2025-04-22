/**
 * Get MIME type from file extension
 * @param extension File extension
 * @private
 */
export const getMimetypeFromExtension = (extension: string): string => {
  const ext = extension.toLowerCase().replace(".", "");
  switch (ext) {
    // Images
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "avif":
      return "image/avif";
    case "svg":
      return "image/svg+xml";

    // Videos
    case "mp4":
      return "video/mp4";

    // Documents
    case "pdf":
      return "application/pdf";
    // Microsoft Office
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "ppt":
      return "application/vnd.ms-powerpoint";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    // OpenOffice/LibreOffice
    case "odt":
      return "application/vnd.oasis.opendocument.text";
    case "ods":
      return "application/vnd.oasis.opendocument.spreadsheet";
    case "odp":
      return "application/vnd.oasis.opendocument.presentation";
    case "odg":
      return "application/vnd.oasis.opendocument.graphics";
    case "odf":
      return "application/vnd.oasis.opendocument.formula";
    case "odc":
      return "application/vnd.oasis.opendocument.chart";
    case "odb":
      return "application/vnd.oasis.opendocument.database";
    case "ott":
      return "application/vnd.oasis.opendocument.text-template";
    case "ots":
      return "application/vnd.oasis.opendocument.spreadsheet-template";
    case "otp":
      return "application/vnd.oasis.opendocument.presentation-template";
    case "otg":
      return "application/vnd.oasis.opendocument.graphics-template";
    // TODO: There are a lot of other office formats, see https://stackoverflow.com/questions/4212861/what-is-a-correct-mime-type-for-docx-pptx-etc
    case "txt":
      return "text/plain";

    default:
      return "application/octet-stream";
  }
};

/**
 * Get content type based on file path
 * @param filePath Path to file
 * @returns MIME type for the file
 */
export const getContentType = (filePath: string): string => {
  const extension = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
  return getMimetypeFromExtension(extension);
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
    // Images
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    case "image/svg+xml":
      return "svg";

    // Videos
    case "video/mp4":
      return "mp4";

    // Documents
    case "application/pdf":
      return "pdf";
    // Microsoft Office
    case "application/msword":
      return "doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "docx";
    case "application/vnd.ms-excel":
      return "xls";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "xlsx";
    case "application/vnd.ms-powerpoint":
      return "ppt";
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return "pptx";
    // OpenOffice/LibreOffice
    case "application/vnd.oasis.opendocument.text":
      return "odt";
    case "application/vnd.oasis.opendocument.spreadsheet":
      return "ods";
    case "application/vnd.oasis.opendocument.presentation":
      return "odp";
    case "application/vnd.oasis.opendocument.graphics":
      return "odg";
    case "application/vnd.oasis.opendocument.formula":
      return "odf";
    case "application/vnd.oasis.opendocument.chart":
      return "odc";
    case "application/vnd.oasis.opendocument.database":
      return "odb";
    case "application/vnd.oasis.opendocument.text-template":
      return "ott";
    case "application/vnd.oasis.opendocument.spreadsheet-template":
      return "ots";
    case "application/vnd.oasis.opendocument.presentation-template":
      return "otp";
    case "application/vnd.oasis.opendocument.graphics-template":
      return "otg";
    case "text/plain":
      return "txt";

    default:
      return "bin";
  }
};

/**
 * Get file extension from filename
 * @param filename Original filename
 * @returns File extension including the dot (e.g., ".pdf")
 */
export const getExtensionFromFilename = (filename?: string): string => {
  if (!filename) return ".bin";

  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    return filename.substring(lastDotIndex);
  }

  return ".bin";
};
