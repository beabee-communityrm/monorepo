import { PaymentMethod } from '@beabee/beabee-common';

import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { type Contact } from './index';

@Entity()
export class ContactContribution {
  @PrimaryColumn()
  contactId!: string;
  @OneToOne('Contact', 'contribution')
  @JoinColumn()
  contact!: Contact;

  @Column({ type: String, nullable: true })
  method!: PaymentMethod | null;

  @Column({ type: String, nullable: true })
  customerId!: string | null;

  @Column({ type: String, nullable: true })
  mandateId!: string | null;

  @Column({ type: String, nullable: true })
  subscriptionId!: string | null;

  @Column({ type: Boolean, nullable: true })
  payFee!: boolean | null;

  @Column({ type: 'jsonb', nullable: true })
  nextAmount!: { chargeable: number; monthly: number } | null;

  @Column({ type: Date, nullable: true })
  cancelledAt!: Date | null;

  static get empty(): Omit<ContactContribution, 'contact' | 'contactId'> {
    return {
      method: null,
      customerId: null,
      mandateId: null,
      subscriptionId: null,
      payFee: null,
      nextAmount: null,
      cancelledAt: null,
    };
  }
}
