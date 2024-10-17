import { ContributionPeriod, PaymentMethod } from "@beabee/beabee-common";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from "typeorm";

import { getActualAmount } from "#utils/payment";

import { type Contact } from "./index";

@Entity()
@Unique(["contactId", "status"])
export class ContactContribution {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  contactId!: string;
  @ManyToOne("Contact", "contributions")
  contact!: Contact;

  @Column({ type: String, nullable: true })
  status!: "pending" | "current" | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: String })
  method!: PaymentMethod;

  @Column({ type: String, nullable: true })
  customerId!: string | null;

  @Column({ type: String, nullable: true })
  mandateId!: string | null;

  @Column({ type: String, nullable: true })
  subscriptionId!: string | null;

  @Column({ type: Number, nullable: true })
  monthlyAmount!: number | null;

  @Column({ type: String, nullable: true })
  period!: ContributionPeriod | null;

  @Column({ type: Boolean, nullable: true })
  payFee!: boolean | null;

  @Column({ type: Date, nullable: true })
  cancelledAt!: Date | null;

  get amount(): number | null {
    return this.monthlyAmount === null || this.period === null
      ? null
      : getActualAmount(this.monthlyAmount, this.period);
  }
}
