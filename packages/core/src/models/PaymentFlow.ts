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
export class PaymentFlow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  date!: Date;

  @Column()
  paymentFlowId!: string;

  @Column()
  loginUrl!: string;

  @Column()
  setPasswordUrl!: string;

  @Column()
  confirmUrl!: string;

  @Column(() => PaymentFlowForm)
  form!: PaymentFlowForm;

  @Column({ type: String, nullable: true })
  contactId!: string | null;
  @ManyToOne('Contact', { nullable: true })
  contact!: Contact | null;
}
