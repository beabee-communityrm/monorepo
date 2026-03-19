import gunzip from 'gunzip-maybe';
import type { FormatEnum } from 'sharp';
import { Readable } from 'stream';
import tar from 'tar-stream';

/**
 * Get MIME type from file extension
 * @param extension File extension or filename
 * @private
 */
export const getMimetypeFromExtension = (extension: string): string => {
  extension = extension.toLowerCase().trim();
  const extWithoutDot = extension.includes('.')
    ? extension.split('.').pop()
    : extension;
  switch (extWithoutDot) {
    // Images
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'avif':
      return 'image/avif';
    case 'svg':
      return 'image/svg+xml';

    // Videos
    case 'mp4':
      return 'video/mp4';

    // Documents
    case 'pdf':
      return 'application/pdf';
    // Microsoft Office
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    // OpenOffice/LibreOffice
    case 'odt':
      return 'application/vnd.oasis.opendocument.text';
    case 'ods':
      return 'application/vnd.oasis.opendocument.spreadsheet';
    case 'odp':
      return 'application/vnd.oasis.opendocument.presentation';
    case 'odg':
      return 'application/vnd.oasis.opendocument.graphics';
    case 'odf':
      return 'application/vnd.oasis.opendocument.formula';
    case 'odc':
      return 'application/vnd.oasis.opendocument.chart';
    case 'odb':
      return 'application/vnd.oasis.opendocument.database';
    case 'ott':
      return 'application/vnd.oasis.opendocument.text-template';
    case 'ots':
      return 'application/vnd.oasis.opendocument.spreadsheet-template';
    case 'otp':
      return 'application/vnd.oasis.opendocument.presentation-template';
    case 'otg':
      return 'application/vnd.oasis.opendocument.graphics-template';
    // TODO: There are a lot of other office formats, see https://stackoverflow.com/questions/4212861/what-is-a-correct-mime-type-for-docx-pptx-etc
    case 'txt':
      return 'text/plain';

    default:
      return 'application/octet-stream';
  }
};

export const getMimetypeFromDecoderFormat = (
  format: keyof FormatEnum
): string => {
  switch (format) {
    case 'avif':
      return 'image/avif';
    case 'dz':
      return 'image/vnd.dz';
    case 'fits':
      return 'image/vnd.fits';
    case 'gif':
      return 'image/gif';
    case 'heif':
      return 'image/heif';
    case 'input':
      return 'image/x-icon';
    case 'jpg':
      return 'image/jpeg';
    case 'jpeg':
      return 'image/jpeg';
    case 'jp2':
      return 'image/jp2';
    case 'jxl':
      return 'image/jxl';
    case 'magick':
      return 'image/vnd.ms-photo';
    case 'openslide':
      return 'image/vnd.open-slidedeck';
    case 'png':
      return 'image/png';
    case 'ppm':
      return 'image/vnd.ppm';
    case 'raw':
      return 'image/vnd.cmu-raster';
    case 'svg':
      return 'image/svg+xml';
    case 'tiff':
    case 'tif':
      return 'image/tiff';
    case 'v':
      return 'image/x-icon';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
};

/**
 * Get file extension from MIME type
 * @param mimetype MIME type
 * @private
 */
export const getExtensionFromMimetype = (mimetype?: string): string => {
  if (!mimetype) return '.bin';

  const mime = mimetype.toLowerCase();
  switch (mime) {
    // Images
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    case 'image/avif':
      return '.avif';
    case 'image/svg+xml':
      return '.svg';
    case 'image/tiff':
      return '.tif';
    case 'image/heif':
      return '.heif';
    case 'image/jp2':
      return '.jp2';
    case 'image/jxl':
      return '.jxl';
    case 'image/x-icon':
      return '.ico';

    // Videos
    case 'video/mp4':
      return '.mp4';

    // Documents
    case 'application/pdf':
      return '.pdf';
    // Microsoft Office
    case 'application/msword':
      return '.doc';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return '.docx';
    case 'application/vnd.ms-excel':
      return '.xls';
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return '.xlsx';
    case 'application/vnd.ms-powerpoint':
      return '.ppt';
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return '.pptx';
    // OpenOffice/LibreOffice
    case 'application/vnd.oasis.opendocument.text':
      return '.odt';
    case 'application/vnd.oasis.opendocument.spreadsheet':
      return '.ods';
    case 'application/vnd.oasis.opendocument.presentation':
      return '.odp';
    case 'application/vnd.oasis.opendocument.graphics':
      return '.odg';
    case 'application/vnd.oasis.opendocument.formula':
      return '.odf';
    case 'application/vnd.oasis.opendocument.chart':
      return '.odc';
    case 'application/vnd.oasis.opendocument.database':
      return '.odb';
    case 'application/vnd.oasis.opendocument.text-template':
      return '.ott';
    case 'application/vnd.oasis.opendocument.spreadsheet-template':
      return '.ots';
    case 'application/vnd.oasis.opendocument.presentation-template':
      return '.otp';
    case 'application/vnd.oasis.opendocument.graphics-template':
      return '.otg';
    case 'text/plain':
      return '.txt';

    default:
      return '.bin';
  }
};

/**
 * Get file extension from filename
 * @param filename Original filename
 * @returns File extension including the dot (e.g., ".pdf")
 */
export const getExtensionFromFilename = (filename?: string): string => {
  if (!filename) return '.bin';

  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex !== -1) {
    return filename.substring(lastDotIndex);
  }

  return '.bin';
};

/**
 * Sanitize filename to prevent path traversal attacks and ensure HTTP header compatibility
 * @param filename Original filename
 * @returns Sanitized filename
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return '';

  // First convert to string just in case
  const filenameStr = String(filename);

  // Remove path components, special characters, and non-ASCII characters
  // Also replace spaces and other potentially problematic characters
  return filenameStr
    .replace(/[/\\?%*:|"<>\x00-\x1F\x7F-\xFF\u0100-\uFFFF]/g, '_') // Replace special, control, and non-ASCII chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/[^\w.-]/g, '_') // Replace any remaining non-alphanumeric chars except dots and hyphens
    .trim(); // Trim any leading/trailing spaces
};

export async function extractJsonArchive<T = unknown>(
  archive: Readable,
  processJson: (json: unknown) => T | null
): Promise<T[]> {
  const extract = tar.extract();
  const responses: T[] = [];

  return new Promise((resolve, reject) => {
    extract.on('entry', (header, stream, next) => {
      if (header.type === 'file') {
        let chunks: Buffer[] = [];

        stream.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        stream.on('end', () => {
          try {
            const content = Buffer.concat(chunks).toString('utf8');
            const jsonData = JSON.parse(content);
            const result = processJson(jsonData);
            if (result !== null) {
              responses.push(result);
            }
            next();
          } catch (error) {
            next(error);
          }
        });

        stream.on('error', next);
      } else {
        stream.resume();
        stream.on('end', next);
      }
    });

    // Handle errors from the source archive stream
    archive.on('error', reject);

    archive
      .pipe(gunzip())
      .pipe(extract)
      .on('error', reject)
      .on('finish', () => resolve(responses));
  });
}
