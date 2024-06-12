import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Callout } from "./Callout.js";

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
