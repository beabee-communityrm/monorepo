import { PaymentFlowParams } from '@beabee/beabee-common';

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { PaymentFlowForm } from '#type/index';

import { Contact } from './Contact';

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

  @Column({ type: 'jsonb' })
  form!: PaymentFlowForm;

  @Column({ type: String, nullable: true })
  contactId!: string | null;
  @ManyToOne('Contact', { nullable: true })
  contact!: Contact | null;
}
