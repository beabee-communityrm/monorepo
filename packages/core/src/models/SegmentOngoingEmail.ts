import type { SegmentOngoingEmailTrigger } from '@beabee/beabee-common';

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type { Email, Segment } from './index';

@Entity()
export class SegmentOngoingEmail {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  date!: Date;

  @Column()
  segmentId!: string;
  @ManyToOne('Segment')
  segment!: Segment;

  @Column()
  trigger!: SegmentOngoingEmailTrigger;

  @Column({ unique: true })
  emailId!: string;
  @ManyToOne('Email')
  email!: Email;

  @Column({ default: false })
  enabled!: boolean;
}
