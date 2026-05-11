import type { PaymentMethod } from '../data/index.js';

export interface PaymentFlowSetupParams {
  paymentMethod: PaymentMethod;
  completeUrl: string;
}

export interface PaymentFlowAdvanceParams {
  token?: string;
  firstname?: string;
  lastname?: string;
  vatNumber?: string;
}
