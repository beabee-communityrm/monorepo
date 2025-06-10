import { RESET_SECURITY_FLOW_TYPE } from '@beabee/beabee-common';

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type { Contact } from './index';

@Entity()
export class ResetSecurityFlow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  contactId!: string;
  @ManyToOne('Contact')
  contact!: Contact;

  @CreateDateColumn()
  date!: Date;

  @Column({ type: String })
  type!: RESET_SECURITY_FLOW_TYPE;
}
