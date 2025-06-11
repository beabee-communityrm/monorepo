import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Callout } from './Callout';
import type { Contact } from './Contact';

@Entity()
@Unique(['callout', 'contact'])
export class CalloutReviewer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  calloutId!: string;
  @ManyToOne('Callout')
  callout!: Callout;

  @Column()
  contactId!: string;
  @ManyToOne('Contact')
  contact!: Contact;

  @CreateDateColumn()
  date!: Date;
}
