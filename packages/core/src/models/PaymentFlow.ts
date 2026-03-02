import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PaymentFlowForm } from '#type/index';

@Entity()
export class PaymentFlow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  date!: Date;

  @Column()
  paymentFlowId!: string;

  @Column({ type: 'jsonb' })
  form!: PaymentFlowForm;
}
