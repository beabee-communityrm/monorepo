import { ItemStatus } from '@beabee/beabee-common';
import type { NoticeData } from '@type';

export interface GetNoticeData extends NoticeData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: ItemStatus;
}
