import type { Rule } from "../types/index.js";

export class InvalidRule extends Error {
  constructor(
    readonly rule: Rule,
    override readonly message: string,
  ) {
    super();
    Object.setPrototypeOf(this, InvalidRule.prototype);
  }
}
