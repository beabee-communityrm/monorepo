import { PaymentFlowResult } from '@beabee/beabee-common';

export interface PaymentFlow {
  id: string;
  result: PaymentFlowResult;
}
