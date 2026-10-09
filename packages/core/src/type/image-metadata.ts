import type { FileMetadata } from './file-metadata.js';

/**
 * Image metadata
 */
export interface ImageMetadata extends FileMetadata {
  /**
   * Original width
   */
  width: number;

  /**
   * Original height
   */
  height: number;
}
