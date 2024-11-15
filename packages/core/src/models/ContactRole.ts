import { RoleType } from "@beabee/beabee-common";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn
} from "typeorm";
import type { Contact } from "./index";
import type { ContactRolePermission } from "./ContactRolePermission";

/**
 * Entity representing a role assigned to a contact
 * Roles can have multiple permissions and expiration dates
 */
@Entity()
export class ContactRole {
  @PrimaryColumn()
  contactId!: string;

  @ManyToOne("Contact", "roles")
  contact!: Contact;

  @PrimaryColumn()
  type!: RoleType;

  @CreateDateColumn()
  dateAdded!: Date;

  @Column({ type: Date, nullable: true })
  dateExpires!: Date | null;

  /**
   * Permissions assigned to this role
   * Managed through ContactRolePermission junction table
   */
  @OneToMany("ContactRolePermission", "role")
  permissionAssignments!: ContactRolePermission[];

  /**
   * Checks if the role is currently active based on dates
   */
  get isActive(): boolean {
    const now = new Date();
    return (
      this.dateAdded <= now && (!this.dateExpires || this.dateExpires >= now)
    );
  }

  /**
   * Checks if the role has a specific permission
   * @param permissionKey - The permission key to check
   */
  hasPermission(permissionKey: string): boolean {
    return this.permissionAssignments.some(
      (pa) => pa.permission.key === permissionKey && pa.permission.isActive
    );
  }
}
