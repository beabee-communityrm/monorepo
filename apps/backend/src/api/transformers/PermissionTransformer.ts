import { Permission } from "@beabee/core/models";
import {
  GetPermissionDto,
  ListPermissionsDto,
  CreatePermissionDto
} from "../dto/PermissionDto";
import { AuthInfo } from "@type/auth-info";
import { BaseTransformer } from "./BaseTransformer";
import { SelectQueryBuilder } from "typeorm";
import { getRepository } from "@beabee/core/database";
import { PermissionService } from "../services/PermissionService";

/**
 * Transformer for handling Permission entities
 * Provides methods for converting, creating, and managing permissions
 */
export class PermissionTransformer extends BaseTransformer<
  Permission,
  GetPermissionDto,
  never,
  unknown,
  ListPermissionsDto
> {
  protected model = Permission;
  protected filters = {};
  protected filterHandlers = {};

  convert(permission: Permission): GetPermissionDto {
    return {
      id: permission.id,
      key: permission.key,
      description: permission.description,
      isActive: permission.isActive
    };
  }

  async create(
    auth: AuthInfo | undefined,
    data: CreatePermissionDto
  ): Promise<Permission> {
    const permissionRepo = getRepository(Permission);

    const existing = await permissionRepo.findOne({
      where: { key: data.key }
    });

    if (existing) {
      throw new Error("Permission with this key already exists");
    }

    return await permissionRepo.save({
      key: data.key,
      description: data.description,
      isActive: data.isActive ?? true
    });
  }

  async assignToRole(
    auth: AuthInfo | undefined,
    roleId: string,
    permissionIds: string[]
  ): Promise<void> {
    await PermissionService.assignPermissionsToRole(roleId, permissionIds);
  }

  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<Permission>,
    fieldPrefix: string,
    query: ListPermissionsDto,
    auth: AuthInfo | undefined
  ): void {
    qb.orderBy(`${fieldPrefix}key`, "ASC");

    if (query.search) {
      qb.andWhere(
        `(${fieldPrefix}key ILIKE :search OR ${fieldPrefix}description ILIKE :search)`,
        { search: `%${query.search}%` }
      );
    }

    if (query.isActive !== undefined) {
      qb.andWhere(`${fieldPrefix}isActive = :isActive`, {
        isActive: query.isActive
      });
    }
  }

  async fetchGrouped(): Promise<Record<string, GetPermissionDto[]>> {
    const permissions = await PermissionService.getAvailablePermissions();

    return permissions.reduce(
      (groups, permission) => {
        const resource = permission.key.split(" ")[1].split("/")[1];
        if (!groups[resource]) {
          groups[resource] = [];
        }
        groups[resource].push(this.convert(permission));
        return groups;
      },
      {} as Record<string, GetPermissionDto[]>
    );
  }
}
