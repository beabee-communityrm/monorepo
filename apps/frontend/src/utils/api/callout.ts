import type { Paginated } from '@beabee/beabee-common';
import { deserializeDate, instance } from '.';
import { deserializeCalloutResponse } from './callout-response';

import type {
  GetCalloutsQuery,
  Serial,
  GetCalloutResponsesQuery,
  CreateCalloutResponseData,
  CreateCalloutData,
  UpdateCalloutData,
  GetCalloutWith,
  GetCalloutDataWith,
  GetCalloutData,
  GetCalloutResponseWith,
  GetCalloutResponseDataWith,
  GetCalloutTagData,
  CreateCalloutTagData,
  UpdateCalloutTagData,
  GetCalloutResponseMapData,
} from '@type';

// TODO: how to make this type safe?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deserializeCallout(callout: any): any {
  return {
    ...callout,
    starts: deserializeDate(callout.starts),
    expires: deserializeDate(callout.expires),
  };
}

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

export async function deleteCallout(slug: string): Promise<void> {
  await instance.delete('/callout/' + slug);
}

export async function fetchResponses<
  With extends GetCalloutResponseWith = void,
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

export async function fetchResponsesForMap(
  slug: string,
  query?: GetCalloutResponsesQuery
): Promise<Paginated<GetCalloutResponseMapData>> {
  const { data } = await instance.get<
    Paginated<Serial<GetCalloutResponseMapData>>
  >(`/callout/${slug}/responses/map`, { params: query });
  return data;
}

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

export async function fetchTags(slug: string): Promise<GetCalloutTagData[]> {
  const { data } = await instance.get<Serial<GetCalloutTagData>[]>(
    `/callout/${slug}/tags`
  );

  return data;
}

export async function createTag(
  slug: string,
  dataIn: CreateCalloutTagData
): Promise<GetCalloutTagData> {
  const { data } = await instance.post<Serial<GetCalloutTagData>>(
    `/callout/${slug}/tags`,
    {
      name: dataIn.name,
      description: dataIn.description,
    }
  );

  return data;
}

export async function updateTag(
  slug: string,
  tagId: string,
  dataIn: UpdateCalloutTagData
): Promise<GetCalloutTagData> {
  const { data } = await instance.patch<Serial<GetCalloutTagData>>(
    `/callout/${slug}/tags/${tagId}`,
    {
      name: dataIn.name,
      description: dataIn.description,
    }
  );

  return data;
}

export async function deleteTag(slug: string, tagId: string): Promise<void> {
  await instance.delete(`/callout/${slug}/tags/${tagId}`);
}
