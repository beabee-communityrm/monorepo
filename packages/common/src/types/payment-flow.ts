import type { PaymentFlowParams } from "./index.ts";

export interface PaymentFlow {
  id: string;
  params: PaymentFlowParams;
}
