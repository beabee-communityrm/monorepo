import type { SegmentOngoingEmailTrigger } from '@beabee/beabee-common';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
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

  @Column()
  emailId!: string;
  @OneToOne('Email', 'ongoingEmail')
  @JoinColumn()
  email!: Email;

  @Column({ default: false })
  enabled!: boolean;
}
