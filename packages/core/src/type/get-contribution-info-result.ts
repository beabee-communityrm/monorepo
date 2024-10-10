import { PaymentSource } from "@beabee/beabee-common";

export interface GetContributionInfoResult {
  paymentSource?: PaymentSource;
  hasPendingPayment?: boolean;
}
