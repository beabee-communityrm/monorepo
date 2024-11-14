import { BadRequestError } from "routing-controllers";

export class DuplicateTagNameError extends BadRequestError {
  readonly code = "duplicate-tag-name";

  constructor(tagName: string) {
    super(`Tag with name "${tagName}" already exists`);
    Object.setPrototypeOf(this, DuplicateTagNameError.prototype);
  }

  static isPostgresError(error: any): boolean {
    return (
      error?.code === "23505" &&
      error?.constraint === "UQ_4f430fb165d3f0dfdfe5121c7c7"
    );
  }
}
