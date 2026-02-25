import { PaymentFlowParams } from '@beabee/beabee-common';

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Contact } from './Contact';
import { PaymentFlowForm } from './PaymentFlowForm';

@Entity()
export class PaymentFlow<Params extends PaymentFlowParams = PaymentFlowParams> {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  date!: Date;

  @Column()
  paymentFlowId!: string;

  @Column({ type: 'jsonb' })
  params!: Params;

  @Column(() => PaymentFlowForm)
  form!: PaymentFlowForm;

  @Column()
  loginUrl!: string;

  @Column()
  setPasswordUrl!: string;

  @Column()
  confirmUrl!: string;

  @Column({ type: String, nullable: true })
  contactId!: string | null;
  @ManyToOne('Contact', { nullable: true })
  contact!: Contact | null;
}
