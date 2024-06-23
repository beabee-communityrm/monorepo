import type { Param } from "./index.ts";

export interface Paramable {
  getParams?: () => Promise<Param[]>;
}
