import { Rule } from "../search";

export default class InvalidRule extends Error {
  constructor(readonly rule: Rule, readonly message: string) {
    super();
    Object.setPrototypeOf(this, InvalidRule.prototype);
  }
}
