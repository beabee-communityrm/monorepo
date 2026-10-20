import type { FileServiceConfig } from './file-service-config.js';
import type { ImageFormat } from './image-format.js';

/**
 * Configuration for the ImageService
 */
export interface ImageServiceConfig extends FileServiceConfig {
  /**
   * Available image sizes to create (in pixels)
   */
  availableWidths: number[];

  /**
   * Image compression quality (0-100)
   */
  quality?: number;

  /**
   * Image format (default: 'avif')
   * Use 'original' to keep the original image format
   */
  format?: ImageFormat;

  /**
   * Maximum dimension (in pixels) for the longest side of the stored
   * original, larger uploads are downscaled to fit
   */
  maxDimension?: number;

  /**
   * Maximum number of pixels (width x height) an uploaded image may have,
   * larger images are rejected before decoding
   */
  maxInputPixels?: number;
}
