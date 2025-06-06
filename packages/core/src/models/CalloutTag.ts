import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { TagData } from '@beabee/beabee-common';
import type { Callout } from './index';

@Entity()
export class CalloutTag implements TagData {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  calloutId!: string;
  @ManyToOne('Callout')
  callout!: Callout;
}
