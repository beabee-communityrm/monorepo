export interface S3Config {
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
}
