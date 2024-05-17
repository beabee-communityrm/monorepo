import type { Paginated, RuleGroup } from '@beabee/beabee-common';
import { deserializeDate, instance } from '.';
import { deserializeContact } from './contact';
import { deserializeComment } from './callout-response-comments';

import type {
  GetCalloutResponseWith,
  GetCalloutResponsesQuery,
  GetCalloutResponseDataWith,
  Serial,
  UpdateCalloutResponseData,
  GetCalloutResponseData,
} from '@type';

// TODO: how to make this type safe?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deserializeCalloutResponse(response: any): any {
  return {
    ...response,
    createdAt: deserializeDate(response.createdAt),
    updatedAt: deserializeDate(response.updatedAt),
    ...(response.assignee && {
      assignee: deserializeContact(response.assignee),
    }),
    ...(response.contact && { contact: deserializeContact(response.contact) }),
    ...(response.latestComment && {
      latestComment: deserializeComment(response.latestComment),
    }),
  };
}

export async function fetchCalloutResponses<
  With extends GetCalloutResponseWith = void,
>(
  query?: GetCalloutResponsesQuery,
  _with?: readonly With[]
): Promise<Paginated<GetCalloutResponseDataWith<With>>> {
  const { data } = await instance.get<
    Paginated<Serial<GetCalloutResponseDataWith<With>>>
  >(`/callout-responses`, { params: { with: _with, ...query } });
  return {
    ...data,
    items: data.items.map(deserializeCalloutResponse),
  };
}

export async function updateCalloutResponses(
  rules: RuleGroup,
  updates: UpdateCalloutResponseData
): Promise<{ affected: number }> {
  const { data } = await instance.patch<Serial<{ affected: number }>>(
    '/callout-responses',
    {
      rules,
      updates,
    }
  );
  return data;
}

export async function fetchCalloutResponse<
  With extends GetCalloutResponseWith = void,
>(
  id: string,
  _with?: readonly With[]
): Promise<GetCalloutResponseDataWith<With>> {
  const { data } = await instance.get<Serial<GetCalloutResponseDataWith<With>>>(
    `/callout-responses/${id}`,
    { params: { with: _with } }
  );
  return deserializeCalloutResponse(data);
}

export async function updateCalloutResponse(
  id: string,
  dataIn: UpdateCalloutResponseData
): Promise<GetCalloutResponseData> {
  const { data } = await instance.patch<Serial<GetCalloutResponseData>>(
    `/callout-responses/${id}`,
    dataIn
  );
  return deserializeCalloutResponse(data);
}
