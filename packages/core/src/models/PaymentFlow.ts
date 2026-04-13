import { PaymentFlowAdvanceParams, PaymentMethod } from '@beabee/beabee-common';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PaymentFlowForm } from '#type/index';

@Entity()
export class PaymentFlow<
  TMethod extends PaymentMethod = PaymentMethod,
  TForm extends PaymentFlowForm = PaymentFlowForm,
> {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  date!: Date;

  @Column()
  providerFlowId!: string;

  @Column()
  method!: TMethod;

  @Column({ type: 'jsonb', nullable: true })
  params!: PaymentFlowAdvanceParams | null;

  @Column({ type: 'jsonb' })
  form!: TForm;

  @Column({ default: false })
  processing!: boolean;
}
