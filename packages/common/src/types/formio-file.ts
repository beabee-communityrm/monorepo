export interface FormioFile {
  /**
   * Storage type of the uploaded file
   */
  storage: 'beabee';
  /**
   * Name of the uploaded file
   */
  name: string;
  /**
   * URL of the uploaded file
   */
  url: string;
  /**
   * Path of the uploaded file
   */
  path: string;
  /**
   * Size of the uploaded file
   */
  size: number;
  /**
   * Hash of the uploaded file
   */
  hash: string;
  /**
   * Original name of the uploaded file
   */
  originalName: string;
}
