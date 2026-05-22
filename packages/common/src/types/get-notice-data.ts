import { ItemStatus } from '../data/index.js';
import { type NoticeData } from './index.js';

export interface GetNoticeData extends NoticeData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: ItemStatus;
}
