import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type { Contact } from './Contact.js';
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

  @Column()
  loginUrl!: string;

  @Column()
  setPasswordUrl!: string;

  @Column()
  confirmUrl!: string;

  @Column({ type: String, nullable: true })
  paymentFlowId!: string | null;
  @OneToOne(() => PaymentFlow, { nullable: true })
  @JoinColumn()
  paymentFlow!: PaymentFlow | null;

  @Column({ type: String, nullable: true })
  contactId!: string | null;
  @ManyToOne('Contact', { nullable: true })
  contact!: Contact | null;

  @Column({ default: false })
  processing!: boolean;
}
