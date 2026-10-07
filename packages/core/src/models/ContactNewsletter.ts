import { NewsletterStatus } from '@beabee/beabee-common';

import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { type Contact } from './index.js';

/** A contact's state in the newsletter provider, owned by NewsletterService */
@Entity()
export class ContactNewsletter {
  @PrimaryColumn()
  contactId!: string;

  @OneToOne('Contact', 'newsletter')
  @JoinColumn()
  contact!: Contact;

  @Column({ default: NewsletterStatus.None })
  status!: NewsletterStatus;

  @Column({ type: 'jsonb', default: '[]' })
  groups!: string[];
}
