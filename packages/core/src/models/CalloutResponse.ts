import {
  CalloutResponseAnswersSlide,
  CalloutResponseNewsletterData
} from "@beabee/beabee-common";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from "typeorm";

import type {
  Contact,
  Callout,
  CalloutResponseComment,
  CalloutResponseTag
} from "./index";

@Entity()
@Unique(["callout", "number"])
export class CalloutResponse {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  calloutId!: string;
  @ManyToOne("Callout", "responses")
  callout!: Callout;

  @Column()
  number!: number;

  @Column({ type: String, nullable: true })
  contactId!: string | null;
  @ManyToOne("Contact", { nullable: true })
  contact!: Contact | null;

  @Column({ type: String, nullable: true })
  guestName!: string | null;

  @Column({ type: String, nullable: true })
  guestEmail!: string | null;

  @Column({ type: "jsonb" })
  answers!: CalloutResponseAnswersSlide;

  @Column({ type: "jsonb", nullable: true })
  newsletter!: CalloutResponseNewsletterData | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: "" })
  bucket!: string;

  @OneToMany("CalloutResponseTag", "response")
  tags!: CalloutResponseTag[];

  @Column({ type: String, nullable: true })
  assigneeId!: string | null;
  @ManyToOne("Contact", { nullable: true })
  assignee!: Contact | null;

  @OneToMany("CalloutResponseComment", "response")
  comments?: CalloutResponseComment[];

  latestComment?: CalloutResponseComment | null;
}
