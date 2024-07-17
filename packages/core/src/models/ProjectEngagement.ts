import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";

import type { Contact, Project } from "./index";

@Entity()
export class ProjectEngagement {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  projectId!: string;
  @ManyToOne("Project")
  project!: Project;

  @Column()
  byContactId!: string;
  @ManyToOne("Contact")
  byContact!: Contact;

  @Column()
  toContactId!: string;
  @ManyToOne("Contact")
  toContact!: Contact;

  @CreateDateColumn()
  date!: Date;

  @Column()
  type!: string;

  @Column({ type: String, nullable: true })
  notes!: string | null;
}
