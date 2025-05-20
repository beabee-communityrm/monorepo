/**
 * Interface defining the structure of metadata used with S3/MinIO objects
 * This ensures consistent casing of metadata fields across services
 */
export interface S3Metadata {
  /**
   * Original filename before sanitization (lowercase as S3 normalizes metadata keys to lowercase)
   */
  originalfilename?: string;

  /**
   * Owner of the file, typically an email address
   */
  owner?: string;
}
