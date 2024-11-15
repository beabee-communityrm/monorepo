import { getMetadataArgsStorage } from "routing-controllers";

/**
 * Extracts all possible permissions from controller decorators using routing-controllers metadata.
 * This function scans all controllers and their actions to generate permission keys.
 *
 * Permission keys are generated in the format: "{HTTP_METHOD} {PATH}"
 * For GET methods, additional sub-permissions are generated for common patterns:
 * - export endpoints (/export)
 * - single item endpoints (/:id)
 *
 * @example
 * // For a controller with base path "/callout" and action "@Get('/responses')",
 * // the following permissions would be generated:
 * // - "GET /callout/responses"
 * // - "GET /callout/responses/export"
 * // - "GET /callout/responses/:id"
 *
 * @returns Array of unique permission keys
 */
export function extractPermissionsFromControllers(): string[] {
  const storage = getMetadataArgsStorage();
  const permissions = new Set<string>();

  // Get all controllers and their actions
  for (const controller of storage.controllers) {
    const basePath = controller.route || "";

    const controllerActions = storage.actions.filter(
      (action) => action.target === controller.target
    );

    for (const action of controllerActions) {
      const method = action.type.toUpperCase();
      const path = (basePath + (action.route || "")).replace(/\/+/g, "/");
      const permission = `${method} ${path}`;
      permissions.add(permission);

      // Also add sub-permissions for specific operations
      if (method === "GET") {
        permissions.add(`${permission}/export`); // For export endpoints
        permissions.add(`${permission}/:id`); // For single item endpoints
      }
    }
  }

  return Array.from(permissions);
}

/**
 * Generates a human-readable description for a permission key.
 * Converts the technical permission key into a user-friendly description.
 *
 * @param permission - Permission key in format "{HTTP_METHOD} {PATH}"
 *
 * @example
 * getPermissionDescription("GET /callout")        // returns "View callout"
 * getPermissionDescription("GET /callout/export") // returns "Export callout"
 * getPermissionDescription("POST /callout")       // returns "Create callout"
 * getPermissionDescription("PATCH /callout")      // returns "Update callout"
 * getPermissionDescription("DELETE /callout")     // returns "Delete callout"
 *
 * @returns Human-readable description of the permission
 */
export function getPermissionDescription(permission: string): string {
  const [method, path] = permission.split(" ");

  const parts = path.split("/").filter(Boolean);
  const resource = parts[0];
  const action = parts[1] || "";

  switch (method) {
    case "GET":
      return action === "export" ? `Export ${resource}` : `View ${resource}`;
    case "POST":
      return `Create ${resource}`;
    case "PATCH":
      return `Update ${resource}`;
    case "DELETE":
      return `Delete ${resource}`;
    default:
      return `${method} ${resource}`;
  }
}
