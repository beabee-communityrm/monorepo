/**
 * Response from uploadFile
 */
export interface UploadFileResponse {
  /** ID of the uploaded image */
  id: string;
  /**
   * URL of the uploaded file
   * @deprecated Use `path` instead in the future to be more flexible as soon as we do not require on form.io.
   */
  url: string;
  /** Path to the uploaded file */
  path: string;
  /** Original filename (if available) */
  filename?: string;
  /** Hash (S3 ETag) of the uploaded file */
  hash: string;
}
