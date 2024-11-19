import { getRepository } from "@beabee/core/database";
import { Permission, ContactRolePermission } from "@beabee/core/models";
import {
  extractPermissionsFromControllers,
  getPermissionDescription
} from "@api/utils";
import { Not, In } from "typeorm";

/**
 * Service to manage system permissions
 * Handles creation, assignment and synchronization of permissions
 */
export class PermissionService {
  /**
   * Synchronizes permissions from controllers with the database
   * Creates new permissions and deactivates removed ones
   */
  static async syncPermissions(): Promise<void> {
    const permissionRepo = getRepository(Permission);
    const extractedPermissions = extractPermissionsFromControllers();

    // Create new permissions
    for (const key of extractedPermissions) {
      const existing = await permissionRepo.findOne({ where: { key } });
      if (!existing) {
        await permissionRepo.save({
          key,
          description: getPermissionDescription(key),
          isActive: true
        });
      }
    }

    // Deactivate permissions that no longer exist
    await permissionRepo.update(
      {
        key: Not(In(extractedPermissions)),
        isActive: true
      },
      { isActive: false }
    );
  }

  /**
   * Returns all active permissions
   */
  static async getAvailablePermissions(): Promise<Permission[]> {
    const permissionRepo = getRepository(Permission);
    return permissionRepo.find({
      where: { isActive: true },
      order: { key: "ASC" }
    });
  }

  /**
   * Assigns permissions to a role
   * @param roleId - ID of the role to assign permissions to
   * @param permissionIds - Array of permission IDs to assign
   */
  static async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<void> {
    const rolePermissionRepo = getRepository(ContactRolePermission);
    await rolePermissionRepo.delete({ roleId });

    const assignments = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
      dateAssigned: new Date()
    }));

    await rolePermissionRepo.save(assignments);
  }

  /**
   * Gets all permissions assigned to a role
   * @param roleId - ID of the role
   */
  static async getRolePermissions(roleId: string): Promise<Permission[]> {
    const rolePermissionRepo = getRepository(ContactRolePermission);
    const assignments = await rolePermissionRepo.find({
      where: { roleId },
      relations: ["permission"]
    });

    return assignments
      .map((assignment) => assignment.permission)
      .filter((permission) => permission.isActive);
  }

  /**
   * Checks if a role has a specific permission
   * @param roleId - ID of the role
   * @param permissionKey - Permission key to check
   */
  static async hasPermission(
    roleId: string,
    permissionKey: string
  ): Promise<boolean> {
    const permissions = await this.getRolePermissions(roleId);
    return permissions.some((p) => p.key === permissionKey);
  }
}
