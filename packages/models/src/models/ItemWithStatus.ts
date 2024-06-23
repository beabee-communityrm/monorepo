import { ItemStatus } from "@beabee/beabee-common";
import { isAfter, isBefore } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Column } from "typeorm";

export class ItemWithStatus {
  @Column({ type: Date, nullable: true })
  starts!: Date | null;

  @Column({ type: Date, nullable: true })
  expires!: Date | null;

  get status(): ItemStatus {
    const now = toZonedTime(new Date(), "UTC");
    if (this.starts === null) {
      return ItemStatus.Draft;
    }
    if (isBefore(now, this.starts)) {
      return ItemStatus.Scheduled;
    }
    if (this.expires && isAfter(now, this.expires)) {
      return ItemStatus.Ended;
    }
    return ItemStatus.Open;
  }

  get active(): boolean {
    return this.status === ItemStatus.Open;
  }
}
