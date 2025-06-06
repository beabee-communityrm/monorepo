import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { CalloutResponse, Contact } from './index';

@Entity()
export class CalloutResponseComment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  contactId!: string;
  @ManyToOne('Contact')
  contact!: Contact;

  @Column()
  responseId!: string;
  @ManyToOne('CalloutResponse')
  response!: CalloutResponse;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: String })
  text!: string;
}
