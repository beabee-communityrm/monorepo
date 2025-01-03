/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type ContactRoleData,
  type ContributionInfo,
  ContributionPeriod,
  type CreateContactData,
  type ForceUpdateContributionData,
  type GetContactData,
  type GetContactDataWith,
  type GetContactsQuery,
  GetContactWith,
  type GetPaymentData,
  type GetPaymentsQuery,
  type Paginated,
  PaymentMethod,
  type RoleType,
  type RuleGroup,
  type Serial,
  type SetContributionData,
  type StartContributionData,
  type UpdateContactData,
  type UpdateContactRoleData,
  type PaymentFlowParams,
} from '@beabee/beabee-common';

import { deserializeDate, instance } from '.';
import env from '../../env';

import { TagOperations } from './tag-operations';

// TODO: how to make this type safe?
/** @deprecated Use the '@beabee/client' package instead */
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

/** @deprecated Use the '@beabee/client' package instead */
function deserializeRole(data: Serial<ContactRoleData>): ContactRoleData {
  return {
    role: data.role,
    dateAdded: deserializeDate(data.dateAdded),
    dateExpires: data.dateExpires ? deserializeDate(data.dateExpires) : null,
  };
}

/** @deprecated Use the '@beabee/client' package instead */
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

/** @deprecated Use the '@beabee/client' package instead */
export async function fetchContacts<With extends GetContactWith | void = void>(
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

/** @deprecated Use the '@beabee/client' package instead */
export async function createContact(
  dataIn: CreateContactData
): Promise<GetContactData> {
  const { data } = await instance.post<Serial<GetContactData>>(
    '/contact',
    dataIn
  );
  return deserializeContact(data);
}

/** @deprecated Use the '@beabee/client' package instead */
export async function fetchContact<With extends GetContactWith | void = void>(
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

/** @deprecated Use the '@beabee/client' package instead */
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

/** @deprecated Use the '@beabee/client' package instead */
export async function updateContacts(
  rules: RuleGroup,
  updates: UpdateContactData
): Promise<{ affected: number }> {
  const { data } = await instance.patch<Serial<{ affected: number }>>(
    '/contact',
    {
      rules,
      updates,
    }
  );
  return data;
}

/** @deprecated Use the '@beabee/client' package instead */
export async function deleteContact(id: string): Promise<void> {
  await instance.delete(`/contact/${id}`);
}

/** @deprecated Use the '@beabee/client' package instead */
export async function fetchContribution(): Promise<ContributionInfo> {
  const { data } = await instance.get<Serial<ContributionInfo>>(
    '/contact/me/contribution'
  );
  return deserializeContribution(data);
}

/** @deprecated Use the '@beabee/client' package instead */
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

/** @deprecated Use the '@beabee/client' package instead */
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

/** @deprecated Use the '@beabee/client' package instead */
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

/** @deprecated Use the '@beabee/client' package instead */
export async function completeStartContribution(
  paymentFlowId: string
): Promise<ContributionInfo> {
  const { data } = await instance.post<Serial<ContributionInfo>>(
    '/contact/me/contribution/complete',
    { paymentFlowId }
  );
  return deserializeContribution(data);
}

/** @deprecated Use the '@beabee/client' package instead */
export async function cancelContribution(id: string): Promise<void> {
  await instance.post(`/contact/${id}/contribution/cancel`);
}

export const updatePaymentMethodCompleteUrl =
  env.appUrl + '/profile/contribution/payment-method/complete';

/** @deprecated Use the '@beabee/client' package instead */
export async function updatePaymentMethod(
  paymentMethod?: PaymentMethod
): Promise<PaymentFlowParams> {
  const { data } = await instance.put<Serial<PaymentFlowParams>>(
    '/contact/me/payment-method',
    { paymentMethod, completeUrl: updatePaymentMethodCompleteUrl }
  );
  return data;
}

/** @deprecated Use the '@beabee/client' package instead */
export async function completeUpdatePaymentMethod(
  paymentFlowId: string
): Promise<ContributionInfo> {
  const { data } = await instance.post<Serial<ContributionInfo>>(
    '/contact/me/payment-method/complete',
    { paymentFlowId }
  );
  return deserializeContribution(data);
}

/** @deprecated Use the '@beabee/client' package instead */
export async function fetchContactPayments(
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

/** @deprecated Use the '@beabee/client' package instead */
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

/** @deprecated Use the '@beabee/client' package instead */
export async function deleteRole(id: string, role: RoleType): Promise<void> {
  await instance.delete(`/contact/${id}/role/${role}`);
}

class ContactTagOperations extends TagOperations {
  getBasePath(contactId: string | undefined): string {
    if (contactId) {
      throw new Error('Contact ID is not supported');
    }
    return '/contact-tags';
  }
}

export const contactTagOperations = new ContactTagOperations();
