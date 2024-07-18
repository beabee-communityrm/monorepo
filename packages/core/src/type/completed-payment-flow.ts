import type { JoinForm } from "#models/index";

export interface CompletedPaymentFlow {
  joinForm: JoinForm;
  customerId: string;
  mandateId: string;
}
