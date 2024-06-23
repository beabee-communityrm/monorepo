import type { Address } from "@beabee/beabee-common";

export interface CompletedPaymentFlowData {
  firstname?: string;
  lastname?: string;
  billingAddress?: Address;
}
