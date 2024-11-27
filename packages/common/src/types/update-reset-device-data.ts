import type { RESET_SECURITY_FLOW_TYPE } from "../data/reset-security-flow-type.ts";

export interface UpdateResetDeviceData {
  password: string;
  /** To support multiple reset device flows in the future */
  type: RESET_SECURITY_FLOW_TYPE;
}
