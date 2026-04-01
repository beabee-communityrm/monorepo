import { PaymentFlowSetupResult } from '@beabee/beabee-common';

export interface PaymentFlowSetup {
  id: string;
  result: PaymentFlowSetupResult;
}
