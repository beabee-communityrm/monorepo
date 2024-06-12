import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { CalloutResponse } from "./CalloutResponse.js";
import { Contact } from "./Contact.js";

@Entity()
export class CalloutResponseComment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  contactId!: string;
  @ManyToOne((type) => Contact)
  contact!: Contact;

  @Column()
  responseId!: string;
  @ManyToOne((type) => CalloutResponse)
  response!: CalloutResponse;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: String })
  text!: string;
}
