import { Rule } from "../search/index.ts";

export default class InvalidRule extends Error {
  constructor(
    readonly rule: Rule,
    readonly message: string,
  ) {
    super();
    Object.setPrototypeOf(this, InvalidRule.prototype);
  }
}
