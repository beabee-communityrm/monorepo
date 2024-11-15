import {
  ContributionInfo,
  ContributionType,
  ContributionPeriod,
  RoleType
} from "@beabee/beabee-common";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";

import { getActualAmount } from "#utils/payment";
import config from "#config/config";

import { Password } from "./Password";

import type {
  ContactContribution,
  ContactProfile,
  ContactRole,
  ContactTag
} from "./index";
import { ContactTagAssignment } from "./ContactTagAssignment";
import type { TagData } from "@beabee/beabee-common";
import type { TaggableEntity, TagAssignment } from "@beabee/core/type";

/**
 * Interface for temporary login override functionality
 */
interface LoginOverride {
  code: string;
  expires: Date;
}

/**
 * Entity representing a contact (user) in the system.
 * Contacts can have roles, permissions, contributions, and tags.
 *
 * @implements TaggableEntity<TagData>
 */
@Entity()
export class Contact implements TaggableEntity<TagData> {
  /**
   * Unique identifier for the contact
   */
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * Contact's email address, must be unique
   */
  @Column({ unique: true })
  email!: string;

  /**
   * Contact's first name
   */
  @Column()
  firstname!: string;

  /**
   * Contact's last name
   */
  @Column()
  lastname!: string;

  /**
   * Contact's password information
   * Embedded entity containing hash and reset details
   */
  @Column(() => Password)
  password!: Password;

  /**
   * Timestamp when the contact joined
   */
  @CreateDateColumn()
  joined!: Date;

  /**
   * Timestamp of contact's last activity
   */
  @Column({ type: Date, nullable: true })
  lastSeen!: Date | null;

  /**
   * Temporary login override information
   */
  @Column({ type: "jsonb", nullable: true })
  loginOverride!: LoginOverride | null;

  /**
   * Type of contribution the contact makes
   */
  @Column()
  contributionType!: ContributionType;

  /**
   * Period of contribution (monthly/annually)
   */
  @Column({ type: String, nullable: true })
  contributionPeriod!: ContributionPeriod | null;

  /**
   * Monthly contribution amount
   */
  @Column({ type: "real", nullable: true })
  contributionMonthlyAmount!: number | null;

  /**
   * Unique referral code for the contact
   */
  @Column({ type: String, unique: true, nullable: true })
  referralCode!: string | null;

  /**
   * Unique polls code for the contact
   */
  @Column({ type: String, unique: true, nullable: true })
  pollsCode!: string | null;

  /**
   * Roles assigned to the contact
   * Eagerly loaded and cascaded on save
   */
  @OneToMany("ContactRole", "contact", { eager: true, cascade: true })
  roles!: ContactRole[];

  /**
   * Contact's profile information
   */
  @OneToOne("ContactProfile", "contact")
  profile!: ContactProfile;

  /**
   * Contact's contribution details
   */
  @OneToOne("ContactContribution", "contact")
  contribution!: ContactContribution;

  contributionInfo?: ContributionInfo;

  /**
   * Tags assigned to the contact
   */
  @OneToMany("ContactTagAssignment", "contact")
  tags!: ContactTagAssignment[];

  /**
   * Get all active role types for the contact
   * If contact has superadmin role, admin role is automatically included
   *
   * @returns Array of active role types
   */
  get activeRoles(): RoleType[] {
    const ret = this.roles.filter((p) => p.isActive).map((p) => p.type);
    if (ret.includes("superadmin")) {
      ret.push("admin");
    }
    return ret;
  }

  /**
   * Get contact's full name
   *
   * @returns Concatenated firstname and lastname, or empty string if neither exists
   */
  get fullname(): string {
    return this.firstname || this.lastname
      ? this.firstname + " " + this.lastname
      : "";
  }

  /**
   * Calculate actual contribution amount based on period
   *
   * @returns Calculated contribution amount or null if no contribution
   */
  get contributionAmount(): number | null {
    return this.contributionMonthlyAmount === null
      ? null
      : getActualAmount(
          this.contributionMonthlyAmount,
          this.contributionPeriod!
        );
  }

  /**
   * Get human-readable description of contribution
   *
   * @returns Formatted string describing contribution type and amount
   */
  get contributionDescription(): string {
    if (this.contributionType === "Gift") {
      return "Gift";
    } else if (
      this.contributionType === "None" ||
      !this.contributionPeriod ||
      !this.contributionMonthlyAmount
    ) {
      return "None";
    } else {
      return `${config.currencySymbol}${this.contributionAmount}/${
        this.contributionPeriod === "monthly" ? "month" : "year"
      }`;
    }
  }

  /**
   * Get member role if it exists
   *
   * @returns ContactRole of type 'member' or undefined
   */
  get membership(): ContactRole | undefined {
    return this.roles.find((p) => p.type === "member");
  }

  /**
   * Check if contact has completed setup
   *
   * @returns true if password has been set
   */
  get setupComplete(): boolean {
    return this.password.hash !== "";
  }

  /**
   * Check if contact has a specific permission
   * Superadmins automatically have all permissions
   *
   * @param permissionKey - The permission key to check
   * @returns true if contact has the permission
   */
  hasPermission(permissionKey: string): boolean {
    if (this.activeRoles.includes("superadmin")) return true;

    return this.roles.some(
      (role) =>
        role.isActive &&
        role.permissionAssignments.some(
          (pa) => pa.permission.key === permissionKey && pa.permission.isActive
        )
    );
  }

  /**
   * Check if contact has a specific role
   * Superadmins automatically have all roles
   *
   * @param roleType - The role type to check
   * @returns true if contact has the role
   */
  hasRole(roleType: RoleType): boolean {
    return (
      this.activeRoles.includes("superadmin") ||
      this.activeRoles.includes(roleType)
    );
  }
}
