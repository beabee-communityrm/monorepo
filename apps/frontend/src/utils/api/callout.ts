import type {
  CreateCalloutData,
  CreateCalloutResponseData,
  GetCalloutData,
  GetCalloutDataWith,
  GetCalloutResponseDataWith,
  GetCalloutResponseMapData,
  GetCalloutResponsesQuery,
  GetCalloutResponseWith,
  GetCalloutReviewerData,
  GetCalloutsQuery,
  GetCalloutWith,
  Paginated,
  Serial,
  UpdateCalloutData,
} from '@beabee/beabee-common';
import { deserializeContact, deserializeDate, instance } from '.';
import { deserializeCalloutResponse } from './callout-response';
import { TagOperations } from './tag-operations';

// TODO: how to make this type safe?
/** @deprecated Use the CalloutClient from the @beabee/client package instead */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deserializeCallout(callout: any): any {
  return {
    ...callout,
    starts: deserializeDate(callout.starts),
    expires: deserializeDate(callout.expires),
  };
}

/** @deprecated Use the CalloutClient from the @beabee/client package instead */
function deserializeCalloutReviewer(
  data: Serial<GetCalloutReviewerData>
): GetCalloutReviewerData {
  return {
    ...data,
    contact: deserializeContact(data.contact),
  };
}

/** @deprecated Use the CalloutClient from the @beabee/client package instead */
export async function fetchCallouts<With extends GetCalloutWith = void>(
  query?: GetCalloutsQuery,
  _with?: readonly With[]
): Promise<Paginated<GetCalloutDataWith<With>>> {
  const { data } = await instance.get<
    Paginated<Serial<GetCalloutDataWith<With>>>
  >('/callout', { params: { with: _with, ...query } });
  return {
    ...data,
    items: data.items.map(deserializeCallout),
  };
}

/** @deprecated Use the CalloutClient from the @beabee/client package instead */
export async function fetchCallout<With extends GetCalloutWith = void>(
  slug: string,
  _with?: readonly With[],
  variant?: string
): Promise<GetCalloutDataWith<With>> {
  const { data } = await instance.get<Serial<GetCalloutDataWith<With>>>(
    '/callout/' + slug,
    { params: { with: _with, variant } }
  );
  return deserializeCallout(data);
}

/** @deprecated Use the CalloutClient from the @beabee/client package instead */
export async function createCallout(
  calloutData: CreateCalloutData
): Promise<GetCalloutData> {
  const { data } = await instance.post<Serial<GetCalloutData>>(
    '/callout',
    // TODO: passing calloutData directly is not safe, it could contain extra properties
    calloutData
  );
  return deserializeCallout(data);
}

/** @deprecated Use the CalloutClient from the @beabee/client package instead */
export async function replicateCallout(
  fromId: string,
  calloutData: UpdateCalloutData
): Promise<GetCalloutData> {
  const { data } = await instance.post<Serial<GetCalloutData>>(
    '/callout/',
    calloutData,
    { params: { fromId } }
  );
  return deserializeCallout(data);
}

/** @deprecated Use the CalloutClient from the @beabee/client package instead */
export async function updateCallout(
  slug: string,
  calloutData: UpdateCalloutData
): Promise<GetCalloutData> {
  const { data } = await instance.patch<Serial<GetCalloutData>>(
    '/callout/' + slug,
    calloutData
  );
  return deserializeCallout(data);
}

/** @deprecated Use the CalloutClient from the @beabee/client package instead */
export async function deleteCallout(slug: string): Promise<void> {
  await instance.delete('/callout/' + slug);
}

/** @deprecated Use the CalloutClient from the @beabee/client package instead */
export async function fetchResponses<
  With extends GetCalloutResponseWith | void = void,
>(
  slug: string,
  query?: GetCalloutResponsesQuery,
  _with?: readonly With[]
): Promise<Paginated<GetCalloutResponseDataWith<With>>> {
  const { data } = await instance.get<
    Paginated<Serial<GetCalloutResponseDataWith<With>>>
  >(`/callout/${slug}/responses`, { params: { with: _with, ...query } });
  return {
    ...data,
    items: data.items.map(deserializeCalloutResponse),
  };
}

/** @deprecated Use the CalloutReviewerClient from the @beabee/client package instead */
export async function fetchResponsesForMap(
  slug: string,
  query?: GetCalloutResponsesQuery
): Promise<Paginated<GetCalloutResponseMapData>> {
  const { data } = await instance.get<
    Paginated<Serial<GetCalloutResponseMapData>>
  >(`/callout/${slug}/responses/map`, { params: query });
  return data;
}

/** @deprecated Use the CalloutClient from the @beabee/client package instead */
export async function createResponse(
  slug: string,
  data: CreateCalloutResponseData,
  captchaToken?: string
): Promise<void> {
  await instance.post(
    `/callout/${slug}/responses`,
    {
      answers: data.answers,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
    },
    { params: { captchaToken } }
  );
}

/** @deprecated Use the CalloutReviewerClient from the @beabee/client package instead */
export async function fetchCalloutReviewers(
  slug: string
): Promise<GetCalloutReviewerData[]> {
  const { data } = await instance.get<Serial<GetCalloutReviewerData[]>>(
    `/callout/${slug}/reviewers`
  );
  return data.map(deserializeCalloutReviewer);
}

/** @deprecated Use the CalloutReviewerClient from the @beabee/client package instead */
export async function addCalloutReviewer(
  slug: string,
  contactId: string
): Promise<void> {
  await instance.post(`/callout/${slug}/reviewers`, { contactId });
}

/** @deprecated Use the CalloutReviewerClient from the @beabee/client package instead */
export async function removeCalloutReviewer(
  slug: string,
  reviewerId: string
): Promise<void> {
  await instance.delete(`/callout/${slug}/reviewers/${reviewerId}`);
}

/** @deprecated Use the CalloutTagClient from the @beabee/client package instead */
class CalloutTagOperations extends TagOperations {
  getBasePath(entityId: string | undefined): string {
    return `/callout/${entityId}/tags`;
  }
}

/** @deprecated Use the CalloutTagClient from the @beabee/client package instead */
export const calloutTagOperations = new CalloutTagOperations();
