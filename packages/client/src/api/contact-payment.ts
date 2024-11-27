import { BaseClient } from "./base.client.ts";
import { cleanUrl } from "../utils/index.ts";
import { ContactContributionClient } from "./contact-contribution.client.ts";
import type { BaseClientOptions } from "../types/index.ts";

import type {
  ContributionInfo,
  GetPaymentData,
  GetPaymentsQuery,
  Paginated,
  PaymentFlowParams,
  Serial,
} from "../deps.ts";
/**
 * Client for managing contribution operations
 */
export class ContactPaymentClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    options.path = cleanUrl(options.path + "/contact");
    super(options);
  }

  async update(
    paymentMethod: string | undefined,
    completeUrl: string,
  ): Promise<PaymentFlowParams> {
    const { data } = await this.fetch.put("/me/payment-method", {
      paymentMethod,
      completeUrl,
    });
    return data;
  }

  async completeUpdate(
    paymentFlowId: string,
  ): Promise<ContributionInfo> {
    const { data } = await this.fetch.post("/me/payment-method/complete", {
      paymentFlowId,
    });
    return ContactContributionClient.deserialize(data);
  }

  async list(
    id: string,
    query: GetPaymentsQuery,
  ): Promise<Paginated<GetPaymentData>> {
    const { data } = await this.fetch.get<Serial<Paginated<GetPaymentData>>>(
      `/${id}/payment`,
      { params: query },
    );
    return {
      ...data,
      items: data.items.map((item) => ({
        chargeDate: ContactPaymentClient.deserializeDate(item.chargeDate),
        amount: item.amount,
        status: item.status,
      })),
    };
  }
}
