import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PaymentFlowForm } from './PaymentFlowForm';

@Entity()
export class PaymentFlow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  date!: Date;

  @Column()
  paymentFlowId!: string;

  @Column(() => PaymentFlowForm)
  form!: PaymentFlowForm;

  @Column({ default: false })
  processing!: boolean;
}
