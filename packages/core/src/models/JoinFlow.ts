import { PaymentFlowParams } from '@beabee/beabee-common';

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Contact } from './Contact';
import { JoinForm } from './JoinForm';

@Entity()
export class JoinFlow<Params extends PaymentFlowParams = PaymentFlowParams> {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  date!: Date;

  @Column()
  paymentFlowId!: string;

  @Column({ type: 'jsonb' })
  paymentFlowParams!: Params;

  @Column()
  loginUrl!: string;

  @Column()
  setPasswordUrl!: string;

  @Column()
  confirmUrl!: string;

  @Column(() => JoinForm)
  joinForm!: JoinForm;

  @Column({ type: String, nullable: true })
  contactId!: string | null;
  @ManyToOne('Contact', { nullable: true })
  contact!: Contact | null;
}
