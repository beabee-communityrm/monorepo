/**
 * Response from uploadFile
 */
export interface UploadFileResponse {
  /** ID of the uploaded image */
  id: string;
  /** URL to the uploaded image (for compatibility with old client) */
  url: string;
}
