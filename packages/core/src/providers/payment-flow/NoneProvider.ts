import { JoinFlow } from "#models/JoinFlow";
import { CompletedPaymentFlow } from "#type/completed-payment-flow";
import { CompletedPaymentFlowData } from "#type/completed-payment-flow-data";
import { PaymentFlow } from "#type/payment-flow";
import { PaymentFlowData } from "#type/payment-flow-data";
import { PaymentFlowProvider } from ".";

class NoneProvider implements PaymentFlowProvider {
  createPaymentFlow(
    joinFlow: JoinFlow,
    completeUrl: string,
    data: PaymentFlowData
  ): Promise<PaymentFlow> {
    throw new Error("Method not implemented.");
  }
  completePaymentFlow(joinFlow: JoinFlow): Promise<CompletedPaymentFlow> {
    throw new Error("Method not implemented.");
  }
  getCompletedPaymentFlowData(
    completedPaymentFlow: CompletedPaymentFlow
  ): Promise<CompletedPaymentFlowData> {
    throw new Error("Method not implemented.");
  }
}

export default new NoneProvider();
