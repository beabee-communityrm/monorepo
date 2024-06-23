import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { CONTACT_MFA_TYPE } from "@beabee/beabee-common";

import type { Contact } from "./Contact.js";

/**
 * The **unsecure** contact multi factor authentication information with the `secret` key
 */
@Entity()
export class ContactMfa {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  contactId!: string;
  @OneToOne("Contact", "mfa")
  @JoinColumn()
  contact!: Contact;

  @Column({ type: String })
  type!: CONTACT_MFA_TYPE;

  @Column({ default: "" })
  secret!: string;
}
