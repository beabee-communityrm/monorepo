import type {
  GetCalloutResponseData,
  GetCalloutResponseDataWith,
  GetCalloutResponsesQuery,
  GetCalloutResponseWith,
  Paginated,
  RuleGroup,
  Serial,
  UpdateCalloutResponseData,
} from '@beabee/beabee-common';
import { deserializeDate, instance } from '.';
import { deserializeContact } from './contact';
import { deserializeComment } from './callout-response-comments';

/** @deprecated Use the CalloutResponseClient from the @beabee/client package instead */
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

/** @deprecated Use the CalloutResponseClient from the @beabee/client package instead */
export async function fetchCalloutResponses<
  With extends GetCalloutResponseWith | void = void,
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

/** @deprecated Use the CalloutResponseClient from the @beabee/client package instead */
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

/** @deprecated Use the CalloutResponseClient from the @beabee/client package instead */
export async function fetchCalloutResponse<
  With extends GetCalloutResponseWith | void = void,
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

/** @deprecated Use the CalloutResponseClient from the @beabee/client package instead */
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
