/** One question and its answer, ready to display */
export interface CalloutResponseAnswerRow {
  /** The component's key, unique within the response */
  key: string;
  /** The question, localised */
  label: string;
  /**
   * The text to show for the answer, or null when there is none — the question
   * was skipped, or the answer renders as an image. Alongside `href` it's the
   * file's name, which older uploads don't have.
   */
  value: string | null;
  /** Link to the uploaded file, when it can't be shown inline */
  href?: string;
  /** The answer as images, for uploaded photos or a signature */
  images?: string[];
  /** Alt text for those images, where there is anything to say */
  imageAlt?: string;
}
