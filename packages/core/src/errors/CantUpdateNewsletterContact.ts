import { InternalServerError } from "routing-controllers";

export class CantUpdateNewsletterContact extends InternalServerError {
  readonly code = "cant-update-newsletter-contact";

  constructor(
    email: string,
    readonly status: number,
    readonly data: any
  ) {
    super("Can't update newsletter contact " + email);
    Object.setPrototypeOf(this, CantUpdateNewsletterContact.prototype);
  }
}
