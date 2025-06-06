import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Export } from './index';

@Entity()
@Index(['export', 'itemId'], { unique: true })
export class ExportItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  exportId!: string;
  @ManyToOne('Export')
  export!: Export;

  @Column()
  itemId!: string;

  @Column()
  status!: string;
}
