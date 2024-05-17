import { deserializeDate, instance } from '.';
import { deserializeContact } from './contact';
import type { Paginated } from '@beabee/beabee-common';

import type {
  CreateCalloutResponseCommentData,
  GetCalloutResponseCommentData,
  GetCalloutResponseCommentsQuery,
  Serial,
  UpdateCalloutResponseCommentData,
} from '@type';

export async function fetchCalloutResponseComments(
  query: GetCalloutResponseCommentsQuery
): Promise<Paginated<GetCalloutResponseCommentData>> {
  const { data } = await instance.get<
    Paginated<Serial<GetCalloutResponseCommentData>>
  >(`/callout-response-comments`, { params: query });
  return {
    ...data,
    items: data.items.map(deserializeComment),
  };
}

export async function createCalloutResponseComment(
  dataIn: CreateCalloutResponseCommentData
): Promise<GetCalloutResponseCommentData> {
  const { data } = await instance.post<Serial<GetCalloutResponseCommentData>>(
    '/callout-response-comments',
    dataIn
  );
  return deserializeComment(data);
}

export async function deleteCalloutResponseComment(id: string): Promise<void> {
  await instance.delete('/callout-response-comments/' + id);
}

export async function updateCalloutResponseComment(
  id: string,
  dataIn: UpdateCalloutResponseCommentData
): Promise<GetCalloutResponseCommentData> {
  const { data } = await instance.patch<Serial<GetCalloutResponseCommentData>>(
    '/callout-response-comments/' + id,
    dataIn
  );
  return deserializeComment(data);
}

export function deserializeComment(
  comment: Serial<GetCalloutResponseCommentData>
): GetCalloutResponseCommentData {
  return {
    ...comment,
    createdAt: deserializeDate(comment.createdAt),
    updatedAt: deserializeDate(comment.updatedAt),
    contact: deserializeContact(comment.contact),
  };
}
