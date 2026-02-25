import { PaymentForm, PaymentPeriod } from '@beabee/beabee-common';

import { Column } from 'typeorm';

import { ReferralGiftForm } from '#type/index';

import { Password } from './Password';

export class PaymentFlowForm implements PaymentForm, ReferralGiftForm {
  @Column()
  email!: string;

  @Column(() => Password)
  password!: Password;

  @Column({ type: 'real' })
  monthlyAmount!: number;

  @Column({ type: String })
  period!: PaymentPeriod;

  @Column()
  payFee!: boolean;

  @Column({ default: false })
  prorate!: boolean;

  @Column({ type: String, nullable: true })
  referralCode?: string | null;

  @Column({ type: String, nullable: true })
  referralGift?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  referralGiftOptions?: Record<string, string> | null;
}
