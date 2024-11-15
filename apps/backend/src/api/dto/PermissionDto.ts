import {
  IsUUID,
  IsArray,
  IsString,
  IsBoolean,
  IsOptional
} from "class-validator";
import { GetPaginatedQuery } from "@api/dto/BaseDto";

/**
 * DTO for assigning permissions to a role
 */
export class AssignPermissionDto {
  @IsUUID("4", { each: true })
  @IsArray()
  permissionIds!: string[];
}

/**
 * DTO for creating a new permission
 */
export class CreatePermissionDto {
  @IsString()
  key!: string;

  @IsString()
  description!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * DTO for updating an existing permission
 */
export class UpdatePermissionDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * DTO for permission response data
 */
export class GetPermissionDto {
  id!: string;
  key!: string;
  description!: string;
  isActive!: boolean;
}

/**
 * DTO for listing permissions with pagination and filters
 */
export class ListPermissionsDto extends GetPaginatedQuery {
  @IsString()
  @IsOptional()
  search?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
