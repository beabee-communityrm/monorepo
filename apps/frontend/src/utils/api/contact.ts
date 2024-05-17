/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ContributionPeriod,
  type Paginated,
  PaymentMethod,
  type RoleType,
} from '@beabee/beabee-common';

import { deserializeDate, instance } from '.';
import env from '../../env';

import type {
  ContributionInfo,
  CreateContactData,
  ForceUpdateContributionData,
  GetContactData,
  GetContactDataWith,
  GetContactsQuery,
  GetContactWith,
  GetPaymentData,
  GetPaymentsQuery,
  ContactRoleData,
  PaymentFlowParams,
  Serial,
  SetContributionData,
  StartContributionData,
  UpdateContactData,
  UpdateContactRoleData,
} from '@type';

// TODO: how to make this type safe?
export function deserializeContact(data: any): any {
  return {
    ...data,
    displayName: `${data.firstname} ${data.lastname}`.trim() || data.email,
    joined: deserializeDate(data.joined),
    lastSeen: deserializeDate(data.lastSeen),
    ...(data.contribution && {
      contribution: deserializeContribution(data.contribution),
    }),
    ...(data.roles && {
      roles: data.roles.map(deserializeRole),
    }),
  };
}

function deserializeRole(data: Serial<ContactRoleData>): ContactRoleData {
  return {
    role: data.role,
    dateAdded: deserializeDate(data.dateAdded),
    dateExpires: data.dateExpires ? deserializeDate(data.dateExpires) : null,
  };
}

function deserializeContribution(
  data: Serial<ContributionInfo>
): ContributionInfo {
  return {
    ...data,
    cancellationDate: deserializeDate(data.cancellationDate),
    membershipExpiryDate: deserializeDate(data.membershipExpiryDate),
    renewalDate: deserializeDate(data.renewalDate),
  };
}

export async function fetchContacts<With extends GetContactWith = void>(
  query: GetContactsQuery,
  _with?: readonly With[]
): Promise<Paginated<GetContactDataWith<With>>> {
  // TODO: fix type safety
  const { data } = await instance.get('/contact', {
    params: { with: _with, ...query },
  });
  return {
    ...data,
    items: data.items.map(deserializeContact),
  };
}

export async function createContact(
  dataIn: CreateContactData
): Promise<GetContactData> {
  const { data } = await instance.post<Serial<GetContactData>>(
    '/contact',
    dataIn
  );
  return deserializeContact(data);
}

export async function fetchContact<With extends GetContactWith = void>(
  id: string,
  _with?: readonly With[]
): Promise<GetContactDataWith<With>> {
  const { data } = await instance.get<Serial<GetContactDataWith<With>>>(
    `/contact/${id}`,
    {
      params: { with: _with },
    }
  );
  return deserializeContact(data);
}

export async function updateContact(
  id: string,
  dataIn: UpdateContactData
): Promise<GetContactData> {
  const { data } = await instance.patch<Serial<GetContactData>>(
    `/contact/${id}`,
    // TODO: passing dataIn directly is not type safe, it could contain extra properties
    dataIn
  );
  return deserializeContact(data);
}

export async function fetchContribution(): Promise<ContributionInfo> {
  const { data } = await instance.get<Serial<ContributionInfo>>(
    '/contact/me/contribution'
  );
  return deserializeContribution(data);
}

export async function updateContribution(
  dataIn: SetContributionData
): Promise<ContributionInfo> {
  const { data } = await instance.patch<Serial<ContributionInfo>>(
    '/contact/me/contribution',
    {
      amount: dataIn.amount,
      period: dataIn.period,
      payFee: dataIn.payFee && dataIn.period === ContributionPeriod.Monthly,
      prorate: dataIn.prorate && dataIn.period === ContributionPeriod.Annually,
    }
  );
  return deserializeContribution(data);
}

export async function forceUpdateContribution(
  id: string,
  dataIn: ForceUpdateContributionData
): Promise<ContributionInfo> {
  const { data } = await instance.patch<Serial<ContributionInfo>>(
    `/contact/${id}/contribution/force`,
    {
      type: dataIn.type,
      amount: dataIn.amount,
      period: dataIn.period,
      source: dataIn.source,
      reference: dataIn.reference,
    }
  );
  return deserializeContribution(data);
}

export const startContributionCompleteUrl =
  env.appUrl + '/profile/contribution/complete';

export async function startContribution(
  dataIn: StartContributionData
): Promise<PaymentFlowParams> {
  const { data } = await instance.post<Serial<PaymentFlowParams>>(
    '/contact/me/contribution',
    {
      amount: dataIn.amount,
      period: dataIn.period,
      payFee: dataIn.payFee && dataIn.period === ContributionPeriod.Monthly,
      prorate: dataIn.prorate && dataIn.period === ContributionPeriod.Annually,
      paymentMethod: dataIn.paymentMethod,
      completeUrl: startContributionCompleteUrl,
    }
  );
  return data;
}

export async function completeStartContribution(
  paymentFlowId: string
): Promise<ContributionInfo> {
  const { data } = await instance.post<Serial<ContributionInfo>>(
    '/contact/me/contribution/complete',
    { paymentFlowId }
  );
  return deserializeContribution(data);
}
export async function cancelContribution(id: string): Promise<void> {
  await instance.post(`/contact/${id}/contribution/cancel`);
}

export const updatePaymentMethodCompleteUrl =
  env.appUrl + '/profile/contribution/payment-method/complete';

export async function updatePaymentMethod(
  paymentMethod?: PaymentMethod
): Promise<PaymentFlowParams> {
  const { data } = await instance.put<Serial<PaymentFlowParams>>(
    '/contact/me/payment-method',
    { paymentMethod, completeUrl: updatePaymentMethodCompleteUrl }
  );
  return data;
}

export async function completeUpdatePaymentMethod(
  paymentFlowId: string
): Promise<ContributionInfo> {
  const { data } = await instance.post<Serial<ContributionInfo>>(
    '/contact/me/payment-method/complete',
    { paymentFlowId }
  );
  return deserializeContribution(data);
}

export async function fetchPayments(
  id: string,
  query: GetPaymentsQuery
): Promise<Paginated<GetPaymentData>> {
  const { data } = await instance.get<Paginated<Serial<GetPaymentData>>>(
    `/contact/${id}/payment`,
    { params: query }
  );
  return {
    ...data,
    items: data.items.map((item) => ({
      chargeDate: deserializeDate(item.chargeDate),
      amount: item.amount,
      status: item.status,
    })),
  };
}

export async function updateRole(
  id: string,
  role: RoleType,
  dataIn: UpdateContactRoleData
): Promise<ContactRoleData> {
  const { data } = await instance.put<Serial<ContactRoleData>>(
    `/contact/${id}/role/${role}`,
    {
      dateAdded: dataIn.dateAdded,
      dateExpires: dataIn.dateExpires,
    }
  );
  return deserializeRole(data);
}

export async function deleteRole(id: string, role: RoleType): Promise<void> {
  await instance.delete(`/contact/${id}/role/${role}`);
}
