// Base validator class
export abstract class BaseValidator {
  // deno-lint-ignore no-explicit-any
  abstract validate(...values: any[]): boolean;
}
