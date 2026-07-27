import { ActivityEventType } from '@beabee/beabee-common';

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index(['contactId', 'createdAt'])
export class ActivityEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  contactId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  actorId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: String })
  eventType!: ActivityEventType;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, string> | null;
}
