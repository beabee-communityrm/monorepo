import { ExportTypeId, ParamValue } from '#type/index';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Export {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  type!: ExportTypeId;

  @Column({ type: 'text' })
  description!: string;

  @CreateDateColumn()
  date!: Date;

  @Column({ type: 'jsonb', nullable: true })
  params!: Record<string, ParamValue> | null;
}
