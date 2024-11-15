import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ContactRolePermission } from "./ContactRolePermission";

/**
 * Entity representing a permission in the system.
 * Permissions are used to control access to specific API endpoints and functionality.
 * They are typically generated automatically from controller routes.
 *
 * @example
 * A permission with key "GET /callout" would allow reading callout data
 * A permission with key "POST /callout" would allow creating new callouts
 */
@Entity()
export class Permission {
  /**
   * Unique identifier for the permission
   */
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * Unique key identifying the permission
   * Format is typically "{HTTP_METHOD} {PATH}"
   *
   * @example
   * "GET /callout"
   * "POST /callout/responses"
   * "PATCH /callout/:id"
   */
  @Column({ unique: true })
  key!: string;

  /**
   * Human-readable description of what the permission allows
   *
   * @example
   * "View all callouts"
   * "Create new callout responses"
   * "Update existing callout"
   */
  @Column()
  description!: string;

  /**
   * Whether this permission is currently active
   * Inactive permissions are treated as if they don't exist
   * This allows "soft deletion" of permissions without breaking existing role assignments
   *
   * @default true
   */
  @Column({ default: true })
  isActive!: boolean;

  /**
   * Many-to-many relationship with roles through ContactRolePermission
   * Represents all role assignments that include this permission
   */
  @OneToMany(() => ContactRolePermission, (assignment) => assignment.permission)
  roleAssignments!: ContactRolePermission[];
}
