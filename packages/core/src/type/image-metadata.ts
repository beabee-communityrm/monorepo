/**
 * Image metadata
 */
export interface ImageMetadata {
  /**
   * Image ID/filename
   */
  id: string;

  /**
   * Original width
   */
  width: number;

  /**
   * Original height
   */
  height: number;

  /**
   * MIME type
   */
  mimetype: string;

  /**
   * Creation date
   */
  createdAt: Date;

  /**
   * File size in bytes
   */
  size: number;
}
