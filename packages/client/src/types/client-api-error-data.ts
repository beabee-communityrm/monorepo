import type { ClientApiErrorData as CommonClientApiErrorData } from "@beabee/beabee-common";

export interface ClientApiErrorData extends CommonClientApiErrorData {
  name?: string;
}
