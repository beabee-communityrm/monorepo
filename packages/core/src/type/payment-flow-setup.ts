import type { PaymentFlowResult } from '@beabee/beabee-common';

export interface PaymentFlowSetup {
  id: string;
  result: PaymentFlowResult;
}
