import {
  ContributionPeriod,
  PaymentForm,
  PaymentMethod,
} from '@beabee/beabee-common';

import { Column } from 'typeorm';

import { ReferralGiftForm } from '#type/index';

import { Password } from './Password';

export class JoinForm implements PaymentForm, ReferralGiftForm {
  @Column()
  email!: string;

  @Column(() => Password)
  password!: Password;

  @Column({ type: 'real' })
  monthlyAmount!: number;

  @Column()
  period!: ContributionPeriod | 'one-time';

  @Column()
  payFee!: boolean;

  @Column({ default: false })
  prorate!: boolean;

  @Column()
  paymentMethod!: PaymentMethod;

  @Column({ type: String, nullable: true })
  firstname?: string | null;

  @Column({ type: String, nullable: true })
  lastname?: string | null;

  @Column({ type: String, nullable: true })
  vatNumber?: string | null;

  @Column({ type: String, nullable: true })
  referralCode?: string | null;

  @Column({ type: String, nullable: true })
  referralGift?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  referralGiftOptions?: Record<string, string> | null;
}
