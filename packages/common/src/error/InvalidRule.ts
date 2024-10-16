import type { Rule } from "../types/index.ts";

export class InvalidRule extends Error {
  constructor(
    readonly rule: Rule,
    override readonly message: string,
  ) {
    super();
    Object.setPrototypeOf(this, InvalidRule.prototype);
  }
}
