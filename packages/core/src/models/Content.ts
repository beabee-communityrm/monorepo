import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { ContentId } from "@beabee/beabee-common";

@Entity()
export class Content {
  @PrimaryColumn()
  id!: ContentId;

  @UpdateDateColumn()
  updated!: Date;

  @Column({ type: "jsonb" })
  data!: Record<string, unknown>;
}
