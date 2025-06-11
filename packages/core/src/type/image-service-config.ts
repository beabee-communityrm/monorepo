import type { ImageFormat } from './image-format';
import type { S3Config } from './s3-config';

/**
 * Configuration for the ImageService
 */
export interface ImageServiceConfig {
  /**
   * Available image sizes to create (in pixels)
   */
  availableWidths: number[];

  /**
   * S3/MinIO configuration
   */
  s3: S3Config;

  /**
   * Image compression quality (0-100)
   */
  quality?: number;

  /**
   * Image format (default: 'avif')
   * Use 'original' to keep the original image format
   */
  format?: ImageFormat;
}
