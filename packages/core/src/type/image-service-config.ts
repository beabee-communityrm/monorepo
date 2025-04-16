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
  s3: {
    /**
     * Endpoint URL
     */
    endpoint: string;

    /**
     * Region
     */
    region: string;

    /**
     * Access key
     */
    accessKey: string;

    /**
     * Secret key
     */
    secretKey: string;

    /**
     * Bucket name
     */
    bucket: string;

    /**
     * Force using path style URLs
     */
    forcePathStyle?: boolean;
  };

  /**
   * Image compression quality (0-100)
   */
  quality?: number;

  /**
   * Image format (default: 'webp')
   */
  format?: "avif" | "webp" | "jpeg" | "png";
}
