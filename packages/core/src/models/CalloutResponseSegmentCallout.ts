import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { Callout } from './Callout';
import { CalloutResponseSegment } from './CalloutResponseSegment';

@Entity()
export class CalloutResponseSegmentCallout {
  @PrimaryColumn()
  segmentId!: string;
  @ManyToOne('CalloutResponseSegment', 'callout')
  segment!: CalloutResponseSegment;

  @PrimaryColumn()
  calloutId!: string;
  @ManyToOne('Callout')
  callout!: Callout;

  @CreateDateColumn()
  date!: Date;
}
