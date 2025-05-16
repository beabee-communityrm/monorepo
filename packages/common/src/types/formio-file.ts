export interface FormioFile {
  storage: "beabee";
  name: string;
  /**
   * URL of the uploaded file
   * @deprecated Use `path` instead in the future to be more flexible as soon as we do not require on form.io.
   */
  url: string;
  path: string;
  size: number;
  hash: string;
  originalName: string;
}
