import { BadRequestError } from "routing-controllers";
import { InvalidCalloutResponseCode } from "../types/index.js";

export class InvalidCalloutResponse extends BadRequestError {
  readonly code = "invalid-callout-response";
  constructor(readonly subCode: InvalidCalloutResponseCode) {
    super();
    Object.setPrototypeOf(this, InvalidCalloutResponse.prototype);
  }
}
