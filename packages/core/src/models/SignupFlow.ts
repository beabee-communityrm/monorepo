import { ContactOriginData, NewsletterStatus } from '@beabee/beabee-common';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Contact } from './Contact.js';
import { Password } from './Password.js';
import { PaymentFlow } from './PaymentFlow.js';

@Entity()
export class SignupFlow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  date!: Date;

  @Column()
  email!: string;

  @Column(() => Password)
  password!: Password;

  @Column({ type: String, nullable: true })
  loginUrl!: string | null;

  @Column({ type: String, nullable: true })
  setPasswordUrl!: string | null;

  @Column({ type: String, nullable: true })
  confirmUrl!: string | null;

  @Column({ type: String, nullable: true })
  postConfirmUrl!: string | null;

  @Column({ type: String, nullable: true })
  paymentFlowId!: string | null;
  @OneToOne(() => PaymentFlow, { nullable: true })
  @JoinColumn()
  paymentFlow!: PaymentFlow | null;

  @Column({ type: String, nullable: true })
  contactId!: string | null;
  @ManyToOne('Contact', { nullable: true })
  contact!: Contact | null;

  /** When the flow was finalized; null on a finalized flow means long ago */
  @Column({ type: Date, nullable: true })
  confirmedAt!: Date | null;

  @Column({ default: false })
  processing!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  origin!: ContactOriginData | null;

  @Column({ type: String, nullable: true })
  newsletterStatus!: NewsletterStatus | null;

  @Column({ type: 'jsonb', nullable: true })
  newsletterGroups!: string[] | null;
}
