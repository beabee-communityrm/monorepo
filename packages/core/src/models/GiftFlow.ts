import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";

import type { Contact } from "./index";
import { GiftForm } from "./GiftForm";

@Entity()
export class GiftFlow {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @CreateDateColumn()
  date!: Date;

  @Column()
  sessionId!: string;

  @Column({ unique: true })
  setupCode!: string;

  @Column(() => GiftForm)
  giftForm!: GiftForm;

  @Column({ default: false })
  completed!: boolean;

  @Column({ default: false })
  processed!: boolean;

  @Column({ type: String, nullable: true })
  gifteeId!: string | null;
  @ManyToOne("Contact")
  giftee!: Contact | null;
}
