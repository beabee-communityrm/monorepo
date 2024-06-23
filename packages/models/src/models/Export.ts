import { ParamValue } from "@beabee/beabee-common";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

export type ExportTypeId = "active-members" | "edition" | "gifts" | "referrals";

@Entity()
export class Export {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  type!: ExportTypeId;

  @Column({ type: "text" })
  description!: string;

  @CreateDateColumn()
  date!: Date;

  @Column({ type: "jsonb", nullable: true })
  params!: Record<string, ParamValue> | null;
}
