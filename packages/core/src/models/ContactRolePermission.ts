import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn
} from "typeorm";
import type { ContactRole } from "./ContactRole";
import type { Permission } from "./Permission";

/**
 * Entity representing the many-to-many relationship between ContactRoles and Permissions.
 * This junction table tracks which permissions are assigned to which roles and when they were assigned.
 *
 * @example
 * A role "Content Editor" might have permissions like:
 * - "GET /callout"
 * - "POST /callout"
 * - "PATCH /callout/:id"
 */
@Entity("contact_role_permissions")
@Index(["roleId", "permissionId"], { unique: true })
export class ContactRolePermission {
  /**
   * ID of the role this permission is assigned to
   * Forms part of the composite primary key
   */
  @PrimaryColumn()
  roleId!: string;

  /**
   * Reference to the ContactRole entity
   * Bidirectional relationship with ContactRole.permissionAssignments
   */
  @ManyToOne("ContactRole", "permissionAssignments")
  role!: ContactRole;

  /**
   * ID of the permission being assigned
   * Forms part of the composite primary key
   */
  @PrimaryColumn()
  permissionId!: string;

  /**
   * Reference to the Permission entity
   * Bidirectional relationship with Permission.roleAssignments
   */
  @ManyToOne("Permission", "roleAssignments")
  permission!: Permission;

  /**
   * Timestamp when this permission was assigned to the role
   * Automatically set when the record is created
   */
  @CreateDateColumn()
  dateAssigned!: Date;
}
