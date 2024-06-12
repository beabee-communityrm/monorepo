import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Option {
  @PrimaryColumn()
  key!: string;

  @Column()
  value!: string;
}
