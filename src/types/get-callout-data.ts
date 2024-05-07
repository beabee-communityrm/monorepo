import type { ItemStatus } from "../data/index.ts";
import type { CalloutData } from "./index.ts";

export interface GetCalloutData extends CalloutData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: ItemStatus;
}
