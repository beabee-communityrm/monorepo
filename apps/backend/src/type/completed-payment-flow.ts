import JoinForm from "@beabee/beabee-core/models/JoinForm";

export interface CompletedPaymentFlow {
  joinForm: JoinForm;
  customerId: string;
  mandateId: string;
}
