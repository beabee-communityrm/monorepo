import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import type { CalloutResponse } from "./CalloutResponse.js";
import type { CalloutTag } from "./CalloutTag.js";

@Entity({})
export class CalloutResponseTag {
  @PrimaryColumn()
  responseId!: string;
  @ManyToOne("CalloutResponse", "tags")
  response!: CalloutResponse;

  @PrimaryColumn()
  tagId!: string;
  @ManyToOne("CalloutTag")
  tag!: CalloutTag;

  @CreateDateColumn()
  date!: Date;
}
