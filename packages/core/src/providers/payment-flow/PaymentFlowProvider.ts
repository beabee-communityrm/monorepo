import { JoinFlow } from "@beabee/models";
import type {
  CompletedPaymentFlow,
  CompletedPaymentFlowData
} from "../../types/index.js";
import type { PaymentFlow, PaymentFlowData } from "@beabee/beabee-common";

export abstract class PaymentFlowProvider {
  abstract createPaymentFlow(
    joinFlow: JoinFlow,
    completeUrl: string,
    data: PaymentFlowData
  ): Promise<PaymentFlow>;

  abstract completePaymentFlow(
    joinFlow: JoinFlow
  ): Promise<CompletedPaymentFlow>;

  abstract getCompletedPaymentFlowData(
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<CompletedPaymentFlowData>;
}
