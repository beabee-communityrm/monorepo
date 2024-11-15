import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import type { TagData } from "@beabee/beabee-common";

@Entity()
export class ContactTag implements TagData {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column()
  description!: string;
}
