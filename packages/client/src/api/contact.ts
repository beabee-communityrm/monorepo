import { BaseClient } from "./base-client.ts";
import { cleanUrl } from "../utils/index.ts";

import type { BaseClientOptions } from "../types/index.ts";
import {
  type ContactRoleData,
  type ContributionInfo,
  ContributionPeriod,
  type CreateContactData,
  type ForceUpdateContributionData,
  type GetContactData,
  type GetContactDataWith,
  type GetContactsQuery,
  type GetContactWith,
  type GetPaymentData,
  type GetPaymentsQuery,
  type Paginated,
  type PaymentFlowParams,
  type RoleType,
  type RuleGroup,
  type Serial,
  type SetContributionData,
  type StartContributionData,
  type UpdateContactData,
  type UpdateContactRoleData,
} from "../deps.ts";

// TODO: Add support for `env.appUrl`
export const START_CONTRIBUTION_COMPLETE_URL = "__appUrl__" +
  "/profile/contribution/complete";

export class ContactClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    options.path = cleanUrl(options.path + "/contact");
    super(options);
  }

  protected deserialize<
    With extends GetContactWith | void = void,
  >(
    // TODO: fix type safety
    // deno-lint-ignore no-explicit-any
    contact: any, // Serial<GetContactDataWith<With>>,
  ): GetContactDataWith<With> {
    return {
      ...contact,
      displayName: `${contact.firstname} ${contact.lastname}`.trim() ||
        contact.email,
      joined: this.deserializeDate(contact.joined),
      lastSeen: this.deserializeDate(contact.lastSeen),
      ...(contact.contribution && {
        contribution: this.deserializeContribution(contact.contribution),
      }),
      ...(contact.roles && {
        roles: contact.roles.map((role: Serial<ContactRoleData>) =>
          this.deserializeRole(role)
        ),
      }),
    };
  }

  protected deserializeRole(data: Serial<ContactRoleData>): ContactRoleData {
    return {
      role: data.role,
      dateAdded: this.deserializeDate(data.dateAdded),
      dateExpires: data.dateExpires
        ? this.deserializeDate(data.dateExpires)
        : null,
    };
  }

  protected deserializeContribution(
    data: Serial<ContributionInfo>,
  ): ContributionInfo {
    return {
      ...data,
      cancellationDate: this.deserializeDate(data.cancellationDate),
      membershipExpiryDate: this.deserializeDate(data.membershipExpiryDate),
      renewalDate: this.deserializeDate(data.renewalDate),
    };
  }

  async list<With extends GetContactWith | void = void>(
    query: GetContactsQuery,
    _with?: readonly With[],
  ): Promise<Paginated<GetContactDataWith<With>>> {
    // TODO: fix type safety
    // deno-lint-ignore no-explicit-any
    const { data } = await this.fetch.get<any>("/", {
      params: { with: _with, ...query },
    });
    return {
      ...data,
      items: data.items.map((item: Serial<GetContactData>) =>
        this.deserialize<With>(item)
      ),
    };
  }

  async create(newData: CreateContactData): Promise<GetContactData> {
    const { data } = await this.fetch.post("/", newData);
    return this.deserialize(data);
  }

  async get<With extends GetContactWith | void = void>(
    id: string,
    _with?: readonly With[],
  ): Promise<GetContactDataWith<With>> {
    const { data } = await this.fetch.get(`/${id}`, {
      params: { with: _with },
    });
    return this.deserialize<With>(data);
  }

  async update(
    id: string,
    updateData: UpdateContactData,
  ): Promise<GetContactData> {
    const { data } = await this.fetch.patch<Serial<GetContactData>>(
      `/${id}`,
      updateData,
    );
    return this.deserialize(data);
  }

  async updateMany(
    rules: RuleGroup,
    updates: UpdateContactData,
  ): Promise<{ affected: number }> {
    const { data } = await this.fetch.patch("/", {
      rules,
      updates,
    });
    return data;
  }

  async delete(id: string): Promise<void> {
    await this.fetch.delete(`/${id}`);
  }

  // Contribution methods
  async getContribution(): Promise<ContributionInfo> {
    const { data } = await this.fetch.get<Serial<ContributionInfo>>(
      "/me/contribution",
    );
    return this.deserializeContribution(data);
  }

  async updateContribution(
    updateData: SetContributionData,
  ): Promise<ContributionInfo> {
    const { data } = await this.fetch.patch<Serial<ContributionInfo>>(
      "/me/contribution",
      {
        amount: updateData.amount,
        period: updateData.period,
        payFee: updateData.payFee &&
          updateData.period === ContributionPeriod.Monthly,
        prorate: updateData.prorate &&
          updateData.period === ContributionPeriod.Annually,
      },
    );
    return this.deserializeContribution(data);
  }

  async forceUpdateContribution(
    id: string,
    updateData: ForceUpdateContributionData,
  ): Promise<ContributionInfo> {
    const { data } = await this.fetch.patch(
      `/${id}/contribution/force`,
      updateData,
    );
    return this.deserializeContribution(data);
  }

  async startContribution(
    startData: StartContributionData,
  ): Promise<PaymentFlowParams> {
    const { data } = await this.fetch.post("/me/contribution", {
      amount: startData.amount,
      period: startData.period,
      payFee: startData.payFee &&
        startData.period === ContributionPeriod.Monthly,
      prorate: startData.prorate &&
        startData.period === ContributionPeriod.Annually,
      paymentMethod: startData.paymentMethod,
      completeUrl: START_CONTRIBUTION_COMPLETE_URL,
    });
    return data;
  }

  async completeStartContribution(
    paymentFlowId: string,
  ): Promise<ContributionInfo> {
    const { data } = await this.fetch.post("/me/contribution/complete", {
      paymentFlowId,
    });
    return this.deserializeContribution(data);
  }

  async cancelContribution(id: string): Promise<void> {
    await this.fetch.post(`/${id}/contribution/cancel`);
  }

  // Payment methods
  async updatePaymentMethod(
    paymentMethod: string | undefined,
    completeUrl: string,
  ): Promise<PaymentFlowParams> {
    const { data } = await this.fetch.put("/me/payment-method", {
      paymentMethod,
      completeUrl,
    });
    return data;
  }

  async completeUpdatePaymentMethod(
    paymentFlowId: string,
  ): Promise<ContributionInfo> {
    const { data } = await this.fetch.post("/me/payment-method/complete", {
      paymentFlowId,
    });
    return this.deserializeContribution(data);
  }

  async getPayments(
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
        chargeDate: this.deserializeDate(item.chargeDate),
        amount: item.amount,
        status: item.status,
      })),
    };
  }

  // Role methods
  async updateRole(
    id: string,
    role: RoleType,
    updateData: UpdateContactRoleData,
  ): Promise<ContactRoleData> {
    const { data } = await this.fetch.put(`/${id}/role/${role}`, {
      dateAdded: updateData.dateAdded,
      dateExpires: updateData.dateExpires,
    });
    return this.deserializeRole(data);
  }

  async deleteRole(id: string, role: RoleType): Promise<void> {
    await this.fetch.delete(`/${id}/role/${role}`);
  }
}
