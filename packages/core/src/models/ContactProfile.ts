import { Address, NewsletterStatus } from '@beabee/beabee-common';

import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { type Contact } from './index';

@Entity()
export class ContactProfile {
  @PrimaryColumn()
  contactId!: string;

  @OneToOne('Contact', 'profile')
  @JoinColumn()
  contact!: Contact;

  @Column({ default: '' })
  description!: string;

  @Column({ type: 'text', default: '' })
  bio!: string;

  @Column({ type: 'text', default: '' })
  notes!: string;

  @Column({ default: '' })
  telephone!: string;

  @Column({ default: '' })
  twitter!: string;

  @Column({ default: '' })
  preferredContact!: string;

  @Column({ default: false })
  deliveryOptIn!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  deliveryAddress!: Address | null;

  @Column({ default: NewsletterStatus.None })
  newsletterStatus!: NewsletterStatus;

  @Column({ type: 'jsonb', default: '[]' })
  newsletterGroups!: string[];
}
