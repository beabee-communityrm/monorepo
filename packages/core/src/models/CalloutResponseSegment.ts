import { RuleGroup } from '@beabee/beabee-common';

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Callout } from './Callout';

@Entity()
export class CalloutResponseSegment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'jsonb' })
  ruleGroup!: RuleGroup;

  @Column({ nullable: true })
  calloutId?: string;
  @ManyToOne(() => Callout, { nullable: true })
  callout?: Callout;

  @Column({ type: 'int', default: 0 })
  order!: number;

  itemCount?: number | undefined;
}
