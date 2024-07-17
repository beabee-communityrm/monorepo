import { BadRequestError } from "routing-controllers";

export class CantUpdateContribution extends BadRequestError {
  readonly code = "cant-update-contribution";

  constructor() {
    super();
    Object.setPrototypeOf(this, CantUpdateContribution.prototype);
  }
}
