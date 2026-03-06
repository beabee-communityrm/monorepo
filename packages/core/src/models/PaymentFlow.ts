import { PaymentFlowParams } from '@beabee/beabee-common';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PaymentFlowForm } from '#type/index';

@Entity()
export class PaymentFlow<
  TParams extends PaymentFlowParams = PaymentFlowParams,
> {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  date!: Date;

  @Column()
  paymentFlowId!: string;

  @Column({ type: 'jsonb' })
  params!: TParams;

  @Column({ type: 'jsonb' })
  form!: PaymentFlowForm;
}
