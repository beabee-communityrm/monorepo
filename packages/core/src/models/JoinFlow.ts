import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Contact } from './Contact';
import { JoinForm } from './JoinForm';

@Entity()
export class JoinFlow {
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

  @Column(() => JoinForm)
  joinForm!: JoinForm;

  @Column({ type: String, nullable: true })
  contactId!: string | null;
  @OneToOne('Contact', { nullable: true })
  @JoinColumn()
  contact!: Contact | null;
}
