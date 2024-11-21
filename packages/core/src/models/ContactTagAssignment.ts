import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn
} from "typeorm";
import { Contact } from "./Contact";
import { ContactTag } from "./ContactTag";
import type { TagData } from "@beabee/beabee-common";
import type { TagAssignment } from "#type";

@Entity("contact_tag_assignments")
@Index(["contactId", "tagId"], { unique: true })
export class ContactTagAssignment implements TagAssignment<TagData> {
  @PrimaryColumn()
  contactId!: string;

  @ManyToOne("Contact", "tags")
  contact!: Contact;

  @PrimaryColumn()
  tagId!: string;

  @ManyToOne(() => ContactTag, { eager: true })
  tag!: ContactTag;

  @CreateDateColumn()
  date!: Date;
}
