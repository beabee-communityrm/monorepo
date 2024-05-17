import { ItemStatus } from "../data/index.ts";
import { NoticeData } from "./index.ts";

export interface GetNoticeData extends NoticeData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: ItemStatus;
}
