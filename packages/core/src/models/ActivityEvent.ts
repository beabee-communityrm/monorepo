import { ActivityActorType, ActivityEventType } from '@beabee/beabee-common';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ActivityEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  contactId!: string | null;

  @Column({ type: String })
  actorType!: ActivityActorType;

  @Column({ type: String, nullable: true })
  actorId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: String })
  eventType!: string;

  @Column({ type: 'jsonb' })
  metadata!: Record<string, string>;
}
