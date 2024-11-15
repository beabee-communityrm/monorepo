import { UnauthorizedError } from "@beabee/core/errors";
import { Contact } from "@beabee/core/models";

/**
 * Method decorator that checks if the current user has the required permission
 * to access the endpoint. Works in conjunction with the Permission system.
 *
 * @param permission - The permission key required to access the endpoint
 *                    Format is typically "{HTTP_METHOD} {PATH}"
 *
 * @throws {UnauthorizedError}
 * - When no Contact object is found in the method arguments
 * - When the Contact doesn't have the required permission
 *
 * @example
 * ```typescript
 * @RequirePermission("GET /callout")
 * async getCallouts() {
 *   // Only accessible if user has "GET /callout" permission
 * }
 *
 * @RequirePermission("POST /callout/responses")
 * async createResponse() {
 *   // Only accessible if user has "POST /callout/responses" permission
 * }
 * ```
 */
export function RequirePermission(permission: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Find the Contact object from the arguments
      const contact = args.find(
        (arg): arg is Contact => arg instanceof Contact
      );

      if (!contact) {
        throw new UnauthorizedError();
      }

      if (!contact.hasPermission(permission)) {
        throw new UnauthorizedError({
          code: "missing-permission",
          message: `Missing required permission: ${permission}`
        });
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
