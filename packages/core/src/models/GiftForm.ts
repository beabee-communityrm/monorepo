import { Address } from "@beabee/beabee-common";
import { Column } from "typeorm";

export class GiftForm {
  @Column()
  firstname!: string;

  @Column()
  lastname!: string;

  @Column()
  email!: string;

  @Column({ type: "date" })
  startDate!: Date;

  @Column({ type: String, nullable: true })
  message!: string | null;

  @Column()
  fromName!: string;

  @Column()
  fromEmail!: string;

  @Column()
  months!: number;

  @Column({ type: "jsonb", nullable: true })
  giftAddress!: Address | null;

  @Column({ type: "jsonb", nullable: true })
  deliveryAddress!: Address | null;
}
