// Base validator class
export abstract class BaseValidator {
  abstract validate(...values: any[]): boolean;
}
