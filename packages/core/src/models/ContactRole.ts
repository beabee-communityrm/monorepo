import { RoleType } from '@beabee/beabee-common';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { type Contact } from './index';

@Entity()
export class ContactRole {
  @PrimaryColumn()
  contactId!: string;
  @ManyToOne('Contact', 'roles')
  contact!: Contact;

  @PrimaryColumn()
  type!: RoleType;

  @CreateDateColumn()
  dateAdded!: Date;

  @Column({ type: Date, nullable: true })
  dateExpires!: Date | null;

  get isActive(): boolean {
    const now = new Date();
    return (
      this.dateAdded <= now && (!this.dateExpires || this.dateExpires >= now)
    );
  }
}
