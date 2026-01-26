import { PaymentStatus, PaymentType } from '@beabee/beabee-common';

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { type Contact } from './index';

@Entity()
export class Payment {
  @PrimaryColumn()
  id!: string;

  @Column({ type: String, nullable: true })
  subscriptionId!: string | null;

  @Column({ type: String, nullable: true })
  contactId!: string | null;
  @ManyToOne('Contact', { nullable: true })
  contact!: Contact | null;

  @Column()
  status!: PaymentStatus;

  @Column()
  type!: PaymentType;

  @Column()
  description!: string;

  @Column({ type: 'real' })
  amount!: number;

  @Column({ type: 'real', nullable: true })
  amountRefunded!: number | null;

  @Column()
  chargeDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  get isPending(): boolean {
    return this.status === PaymentStatus.Pending;
  }
  get isSuccessful(): boolean {
    return this.status === PaymentStatus.Successful;
  }
}
