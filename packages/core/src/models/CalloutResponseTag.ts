import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import type { CalloutResponse, CalloutTag } from './index';

@Entity({})
export class CalloutResponseTag {
  @PrimaryColumn()
  responseId!: string;
  @ManyToOne('CalloutResponse', 'tags')
  response!: CalloutResponse;

  @PrimaryColumn()
  tagId!: string;
  @ManyToOne('CalloutTag')
  tag!: CalloutTag;

  @CreateDateColumn()
  date!: Date;
}
