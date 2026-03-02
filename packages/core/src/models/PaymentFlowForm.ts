import {
  PaymentForm,
  PaymentMethod,
  PaymentPeriod,
} from '@beabee/beabee-common';

import { Column } from 'typeorm';

export class PaymentFlowForm implements PaymentForm {
  @Column({ type: 'real' })
  monthlyAmount!: number;

  @Column({ type: String })
  period!: PaymentPeriod;

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
}
