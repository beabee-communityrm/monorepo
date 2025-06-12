import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GiftForm } from './GiftForm';
import type { Contact } from './index';

@Entity()
export class GiftFlow {
  @PrimaryGeneratedColumn('uuid')
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
  @ManyToOne('Contact')
  giftee!: Contact | null;
}
