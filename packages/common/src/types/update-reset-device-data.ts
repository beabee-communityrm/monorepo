import type { RESET_SECURITY_FLOW_TYPE } from "../data/index.ts";

export interface UpdateResetDeviceData {
  password: string;
  /** To support multiple reset device flows in the future */
  type: RESET_SECURITY_FLOW_TYPE;
}
