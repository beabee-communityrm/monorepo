import { CalloutVariantNavigationData } from '@beabee/beabee-common';

import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import type { Callout } from './index';

@Entity()
@Unique(['calloutId', 'name'])
export class CalloutVariant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  calloutId!: string;
  @ManyToOne('Callout')
  callout!: Callout;

  @Column()
  name!: string;

  @Column()
  title!: string;

  @Column()
  excerpt!: string;

  @Column()
  intro!: string;

  @Column()
  thanksTitle!: string;

  @Column()
  thanksText!: string;

  @Column({ type: String, nullable: true })
  thanksRedirect!: string | null;

  @Column({ type: String, nullable: true })
  shareTitle!: string | null;

  @Column({ type: String, nullable: true })
  shareDescription!: string | null;

  @Column({ type: 'jsonb' })
  slideNavigation!: Record<string, CalloutVariantNavigationData>;

  @Column({ type: 'jsonb', default: '{}' })
  componentText!: Record<string, string>;

  @Column({ type: 'jsonb', default: '{}' })
  responseLinkText!: Record<string, string>;

  @Column({ type: String, nullable: true })
  responseEmailSubject!: string | null;

  @Column({ type: 'text', nullable: true })
  responseEmailBody!: string | null;
}
