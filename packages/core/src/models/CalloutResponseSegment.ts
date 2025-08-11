import { RuleGroup } from '@beabee/beabee-common';

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CalloutResponseSegment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ default: '' })
  description!: string;

  @Column({ type: 'jsonb' })
  ruleGroup!: RuleGroup;

  @Column({ type: 'int', default: 0 })
  order!: number;

  calloutResponseCount?: number;
}
