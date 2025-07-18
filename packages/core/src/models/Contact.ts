import {
  ContributionInfo,
  ContributionPeriod,
  ContributionType,
  RoleType,
} from '@beabee/beabee-common';
import type { TagData } from '@beabee/beabee-common';

import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import config from '#config/config';
import type { TaggableEntity } from '#type';
import { getContributionDescription } from '#utils/contact';
import { getActualAmount } from '#utils/payment';

import { ContactTagAssignment } from './ContactTagAssignment';
import { Password } from './Password';
import type { ContactContribution, ContactProfile, ContactRole } from './index';

interface LoginOverride {
  code: string;
  expires: Date;
}

@Entity()
export class Contact implements TaggableEntity<TagData> {
  @PrimaryGeneratedColumn('uuid')
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

  @Column({ type: 'jsonb', nullable: true })
  loginOverride!: LoginOverride | null;

  @Column()
  contributionType!: ContributionType;

  @Column({ type: String, nullable: true })
  contributionPeriod!: ContributionPeriod | null;

  @Column({ type: 'real', nullable: true })
  contributionMonthlyAmount!: number | null;

  @Column({ type: String, unique: true, nullable: true })
  referralCode!: string | null;

  @Column({ type: String, unique: true, nullable: true })
  pollsCode!: string | null;

  @OneToMany('ContactRole', 'contact', { eager: true, cascade: true })
  roles!: ContactRole[];

  @OneToOne('ContactProfile', 'contact')
  profile!: ContactProfile;

  @OneToOne('ContactContribution', 'contact')
  contribution!: ContactContribution;

  contributionInfo?: ContributionInfo;

  @OneToMany('ContactTagAssignment', 'contact')
  tags!: ContactTagAssignment[];

  isReviewer?: boolean;

  get activeRoles(): RoleType[] {
    const ret = this.roles.filter((p) => p.isActive).map((p) => p.type);
    if (ret.includes('superadmin')) {
      ret.push('admin');
    }
    return ret;
  }

  hasRole(roleType: RoleType): boolean {
    return (
      this.activeRoles.includes('superadmin') ||
      this.activeRoles.includes(roleType)
    );
  }

  get fullname(): string {
    return this.firstname || this.lastname
      ? this.firstname + ' ' + this.lastname
      : '';
  }

  get contributionAmount(): number | null {
    return this.contributionMonthlyAmount === null
      ? null
      : getActualAmount(
          this.contributionMonthlyAmount,
          this.contributionPeriod!
        );
  }

  /**
   * @deprecated Remove once legacy app no longer uses it
   */
  get contributionDescription(): string {
    return getContributionDescription(
      this.contributionType,
      this.contributionMonthlyAmount,
      this.contributionPeriod
    );
  }

  get membership(): ContactRole | undefined {
    return this.roles.find((p) => p.type === 'member');
  }

  get setupComplete(): boolean {
    return this.password.hash !== '';
  }
}
