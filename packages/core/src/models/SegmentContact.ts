import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import type { Contact, Segment } from './index';

@Entity()
export class SegmentContact {
  @PrimaryColumn()
  segmentId!: string;
  @ManyToOne('Segment', 'contacts')
  segment!: Segment;

  @PrimaryColumn()
  contactId!: string;
  @ManyToOne('Contact')
  contact!: Contact;

  @CreateDateColumn()
  date!: Date;
}
