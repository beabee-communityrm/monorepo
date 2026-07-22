import { ItemStatus } from '@beabee/beabee-common';

export interface ItemWithStatus {
  status: ItemStatus;
  starts: Date | null;
  expires: Date | null;
}
