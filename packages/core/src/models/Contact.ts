import {
  ContributionInfo,
  ContributionType,
  ContributionPeriod,
  RoleType,
  MembershipStatus
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

import type { ContactContribution, ContactProfile, ContactRole } from "./index";
import { Password } from "./Password";

interface LoginOverride {
  code: string;
  expires: Date;
}

@Entity()
export class Contact {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  firstname!: string;

  @Column()
  lastname!: string;

  @Column(() => Password)
  password!: Password;

  @CreateDateColumn()
  joined!: Date;

  @Column({ type: Date, nullable: true })
  lastSeen!: Date | null;

  @Column({ type: "jsonb", nullable: true })
  loginOverride!: LoginOverride | null;

  @Column()
  contributionType!: ContributionType;

  @Column({ type: String, nullable: true })
  contributionPeriod!: ContributionPeriod | null;

  @Column({ type: "real", nullable: true })
  contributionMonthlyAmount!: number | null;

  @Column({ type: String, unique: true, nullable: true })
  referralCode!: string | null;

  @Column({ type: String, unique: true, nullable: true })
  pollsCode!: string | null;

  @OneToMany("ContactRole", "contact", { eager: true, cascade: true })
  roles!: ContactRole[];

  @OneToOne("ContactProfile", "contact")
  profile!: ContactProfile;

  @OneToMany("ContactContribution", "contact")
  contributions!: ContactContribution[];

  get contribution(): ContactContribution {
    return this.contributions.find((c) => c.status === "current")!;
  }

  contributionInfo?: ContributionInfo;

  /**
   * Get the active roles of the contact. The roles must be loaded for this to
   * work.
   */
  get activeRoles(): RoleType[] {
    const ret = this.roles.filter((p) => p.isActive).map((p) => p.type);
    if (ret.includes("superadmin")) {
      ret.push("admin");
    }
    return ret;
  }

  hasRole(roleType: RoleType): boolean {
    return (
      this.activeRoles.includes("superadmin") ||
      this.activeRoles.includes(roleType)
    );
  }

  get fullname(): string {
    return this.firstname || this.lastname
      ? this.firstname + " " + this.lastname
      : "";
  }

  /**
   * @deprecated
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
      const amount =
        this.contributionMonthlyAmount === null
          ? null
          : getActualAmount(
              this.contributionMonthlyAmount,
              this.contributionPeriod!
            );
      return `${config.currencySymbol}${amount}/${
        this.contributionPeriod === "monthly" ? "month" : "year"
      }`;
    }
  }

  /**
   * Get the membership role of the contact. The roles must be loaded for this
   * to work.
   */
  get membership(): ContactRole | undefined {
    return this.roles.find((p) => p.type === "member");
  }

  /**
   * Get the membership status of the contact. The roles and contributions must
   * be loaded for this to work.
   */
  get membershipStatus(): MembershipStatus {
    return this.membership
      ? this.membership.isActive
        ? this.contribution.cancelledAt
          ? MembershipStatus.Expiring
          : MembershipStatus.Active
        : MembershipStatus.Expired
      : MembershipStatus.None;
  }

  /**
   * @deprecated
   */
  get setupComplete(): boolean {
    return this.password.hash !== "";
  }
}
