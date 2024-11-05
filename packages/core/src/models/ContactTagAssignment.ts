import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn
} from "typeorm";
import type { Contact, ContactTag } from "./index";

@Entity("contact_tag_assignments")
@Index(["contactId", "tagId"], { unique: true })
export class ContactTagAssignment {
  @PrimaryColumn()
  contactId!: string;
  @ManyToOne("Contact", "tagAssignments")
  contact!: Contact;

  @PrimaryColumn()
  tagId!: string;
  @ManyToOne("ContactTag")
  tag!: ContactTag;

  @CreateDateColumn()
  date!: Date;
}
