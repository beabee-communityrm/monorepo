import {
  ActivityActorType,
  ActivityEventMetadata,
  ActivityEventType,
} from '@beabee/beabee-common';

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index(['targetId', 'createdAt'])
export class ActivityEvent<T extends ActivityEventType = ActivityEventType> {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  targetId!: string | null;

  @Column({ type: String })
  actorType!: ActivityActorType;

  @Column({ type: 'uuid', nullable: true })
  actorId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: String })
  eventType!: T;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: ActivityEventMetadata<T> | null;
}
