import { InternalServerError } from "routing-controllers";

export class CantUpdateMCMember extends InternalServerError {
  readonly code = "cant-update-mc-member";

  constructor(
    email: string,
    readonly status: number,
    readonly data: any
  ) {
    super("Can't update Mailchimp member " + email);
    Object.setPrototypeOf(this, CantUpdateMCMember.prototype);
  }
}
