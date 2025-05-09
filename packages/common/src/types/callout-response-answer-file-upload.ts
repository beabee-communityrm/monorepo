export interface CalloutResponseAnswerFileUpload {
  /**
   * URL of the uploaded file
   * @deprecated Use `path` instead in the future to be more flexible as soon as we do not require on form.io.
   */
  url: string;
  path: string;
}
