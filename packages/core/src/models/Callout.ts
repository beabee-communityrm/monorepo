import {
  SetCalloutFormSchema,
  CalloutResponseViewSchema,
  CalloutData,
  CalloutAccess,
  CalloutCaptcha,
  CalloutChannel,
  type CalloutNewsletterSchema,
} from '@beabee/beabee-common';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import type { CalloutResponse, CalloutTag, CalloutVariant } from './index';
import { ItemWithStatus } from './ItemWithStatus';

@Entity()
export class Callout extends ItemWithStatus implements CalloutData {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  slug!: string;

  @CreateDateColumn()
  date!: Date;

  @Column()
  image!: string;

  @Column({ type: 'jsonb' })
  formSchema!: SetCalloutFormSchema;

  @Column({ type: 'jsonb', nullable: true })
  responseViewSchema!: CalloutResponseViewSchema | null;

  @Column({ type: String, nullable: true })
  mcMergeField!: string | null;

  @Column({ type: String, nullable: true })
  pollMergeField!: string | null;

  @Column()
  allowUpdate!: boolean;

  @Column({ default: false })
  allowMultiple!: boolean;

  @Column({ default: CalloutAccess.Member })
  access!: CalloutAccess;

  @Column({ type: 'jsonb', nullable: true })
  newsletterSchema!: CalloutNewsletterSchema | null;

  @Column({ default: CalloutCaptcha.None })
  captcha!: CalloutCaptcha;

  @Column({ default: false })
  hidden!: boolean;

  @OneToMany('CalloutResponse', 'callout')
  responses!: CalloutResponse[];

  @OneToMany('CalloutTag', 'callout')
  tags!: CalloutTag[];

  @OneToMany('CalloutVariant', 'callout')
  variants!: CalloutVariant[];

  variantNames?: string[];
  hasAnswered?: boolean;
  responseCount?: number;

  @Column({ type: 'jsonb', nullable: true })
  channels!: CalloutChannel[] | null;
}
