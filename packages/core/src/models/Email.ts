import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { type EmailMailing, type SegmentOngoingEmail } from './index.js';

@Entity()
export class Email {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  date!: Date;

  /**
   * Template ID for system email overrides.
   * - null: Custom email (for mailings, segments, etc.)
   * - string: Override for a system template (e.g. "welcome", "reset-password")
   * UNIQUE constraint ensures each template can have at most one override.
   */
  @Column({ type: String, nullable: true, unique: true })
  templateId!: string | null;

  @Column()
  name!: string;

  @Column({ type: String, nullable: true })
  fromName!: string | null;

  @Column({ type: String, nullable: true })
  fromEmail!: string | null;

  @Column()
  subject!: string;

  @Column({ type: 'text' })
  body!: string;

  @OneToMany('EmailMailing', 'email')
  mailings!: EmailMailing[];

  mailingCount?: number;

  @OneToOne('SegmentOngoingEmail', 'email')
  ongoingEmail!: SegmentOngoingEmail | null;
}
