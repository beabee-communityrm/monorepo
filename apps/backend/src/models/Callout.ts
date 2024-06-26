import {
  SetCalloutFormSchema,
  CalloutData,
  CalloutAccess,
  CalloutCaptcha,
  CalloutChannel
} from "@beabee/beabee-common";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";

import ItemWithStatus from "./ItemWithStatus";
import type CalloutResponse from "./CalloutResponse";
import type CalloutTag from "./CalloutTag";
import type CalloutVariant from "./CalloutVariant";

import { CalloutResponseViewSchema } from "@type/index";

@Entity()
export default class Callout extends ItemWithStatus implements CalloutData {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  slug!: string;

  @CreateDateColumn()
  date!: Date;

  @Column()
  image!: string;

  @Column({ type: "jsonb" })
  formSchema!: SetCalloutFormSchema;

  @Column({ type: "jsonb", nullable: true })
  responseViewSchema!: CalloutResponseViewSchema | null;

  @Column({ type: String, nullable: true })
  mcMergeField!: string | null;

  @Column({ type: String, nullable: true })
  pollMergeField!: string | null;

  @Column()
  allowUpdate!: boolean;

  @Column({ default: false })
  allowMultiple!: boolean;

  @Column({ default: CalloutAccess.Member })
  access!: CalloutAccess;

  @Column({ default: CalloutCaptcha.None })
  captcha!: CalloutCaptcha;

  @Column({ default: false })
  hidden!: boolean;

  @OneToMany("CalloutResponse", "callout")
  responses!: CalloutResponse[];

  @Column({ nullable: true })
  responsePassword?: string;

  @OneToMany("CalloutTag", "callout")
  tags!: CalloutTag[];

  @OneToMany("CalloutVariant", "callout")
  variants!: CalloutVariant[];

  variantNames?: string[];
  hasAnswered?: boolean;
  responseCount?: number;

  @Column({ type: "jsonb", nullable: true })
  channels!: CalloutChannel[] | null;
}
