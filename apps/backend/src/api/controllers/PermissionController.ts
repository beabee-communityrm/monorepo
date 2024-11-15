import {
  Body,
  Get,
  JsonController,
  Param,
  Post,
  QueryParams
} from "routing-controllers";
import { RequirePermission } from "@beabee/core/decorators";
import { CurrentAuth } from "@api/decorators/CurrentAuth";

import { PermissionTransformer } from "@api/transformers/PermissionTransformer";
import {
  CreatePermissionDto,
  AssignPermissionDto,
  GetPermissionDto,
  ListPermissionsDto
} from "@api/dto/PermissionDto";
import { PaginatedDto } from "@api/dto/PaginatedDto";
import { AuthInfo } from "@type/auth-info";

/**
 * Controller for managing system permissions
 * Handles CRUD operations and permission assignments for roles
 */
@JsonController("/permissions")
export class PermissionController {
  private transformer = new PermissionTransformer();

  /**
   * Retrieves a paginated list of permissions
   * @param auth Authentication information of the requesting user
   * @param query Query parameters for filtering and pagination
   * @returns Paginated list of permissions
   */
  @Get("/")
  @RequirePermission("GET /permissions")
  async getPermissions(
    @CurrentAuth() auth: AuthInfo | undefined,
    @QueryParams() query: ListPermissionsDto
  ): Promise<PaginatedDto<GetPermissionDto>> {
    return await this.transformer.fetch(auth, query);
  }

  /**
   * Retrieves permissions grouped by their resource type
   * @returns Object with permissions grouped by resource
   * @example
   * {
   *   "users": [{ id: "1", key: "GET /users", ... }],
   *   "roles": [{ id: "2", key: "GET /roles", ... }]
   * }
   */
  @Get("/grouped")
  @RequirePermission("GET /permissions/grouped")
  async getGroupedPermissions(): Promise<Record<string, GetPermissionDto[]>> {
    return await this.transformer.fetchGrouped();
  }

  /**
   * Creates a new permission
   * @param auth Authentication information of the requesting user
   * @param data Data for creating the permission
   * @returns The created permission
   * @throws Error if a permission with the same key already exists
   */
  @Post("/")
  @RequirePermission("POST /permissions")
  async createPermission(
    @CurrentAuth() auth: AuthInfo | undefined,
    @Body() data: CreatePermissionDto
  ): Promise<GetPermissionDto> {
    const permission = await this.transformer.create(auth, data);
    return this.transformer.convert(permission);
  }

  /**
   * Assigns permissions to a role
   * @param auth Authentication information of the requesting user
   * @param roleId ID of the role to assign permissions to
   * @param data Data containing permission IDs to assign
   */
  @Post("/:roleId/assign")
  @RequirePermission("POST /permissions/:roleId/assign")
  async assignPermissions(
    @CurrentAuth() auth: AuthInfo | undefined,
    @Param("roleId") roleId: string,
    @Body() data: AssignPermissionDto
  ): Promise<void> {
    await this.transformer.assignToRole(auth, roleId, data.permissionIds);
  }
}
