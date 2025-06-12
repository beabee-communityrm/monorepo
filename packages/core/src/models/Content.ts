import { ContentId } from '@beabee/beabee-common';

import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Content {
  @PrimaryColumn()
  id!: ContentId;

  @UpdateDateColumn()
  updated!: Date;

  @Column({ type: 'jsonb' })
  data!: Record<string, unknown>;
}
