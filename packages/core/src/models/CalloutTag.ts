import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Callout } from "./index";

@Entity()
export class CalloutTag {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  calloutId!: string;
  @ManyToOne("Callout")
  callout!: Callout;
}
