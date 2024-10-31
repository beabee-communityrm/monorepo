import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { TagData } from "@beabee/beabee-common";
import type { Contact } from "./index";

// Note: This is very similar to CalloutTag, maybe a common model makes sense
@Entity()
export class ContactTag implements TagData {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  ContactId!: string;
  @ManyToOne("Contact")
  Contact!: Contact;
}
