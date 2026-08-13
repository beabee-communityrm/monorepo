import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@Index(['targetId', 'createdAt'])
export class ActivityEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  targetId!: string | null;

  @Column({ type: String })
  contactId!: string;

  @Column({ type: String, nullable: true })
  actorId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: String })
  eventType!: string;

  @Column({ type: 'jsonb' })
  metadata!: Record<string, string>;
}
