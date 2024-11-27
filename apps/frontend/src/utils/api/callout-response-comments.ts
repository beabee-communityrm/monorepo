import { deserializeDate, instance } from '.';
import { deserializeContact } from './contact';
import type {
  CreateCalloutResponseCommentData,
  GetCalloutResponseCommentData,
  GetCalloutResponseCommentsQuery,
  Paginated,
  Serial,
  UpdateCalloutResponseCommentData,
} from '@beabee/beabee-common';

/** @deprecated Use the CalloutResponseCommentClient from the @beabee/client package instead */
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

/** @deprecated Use the CalloutResponseCommentClient from the @beabee/client package instead */
export async function createCalloutResponseComment(
  dataIn: CreateCalloutResponseCommentData
): Promise<GetCalloutResponseCommentData> {
  const { data } = await instance.post<Serial<GetCalloutResponseCommentData>>(
    '/callout-response-comments',
    dataIn
  );
  return deserializeComment(data);
}

/** @deprecated Use the CalloutResponseCommentClient from the @beabee/client package instead */
export async function deleteCalloutResponseComment(id: string): Promise<void> {
  await instance.delete('/callout-response-comments/' + id);
}

/** @deprecated Use the CalloutResponseCommentClient from the @beabee/client package instead */
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

/** @deprecated Use the CalloutResponseCommentClient from the @beabee/client package instead */
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
