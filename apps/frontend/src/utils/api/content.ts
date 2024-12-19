import type { ContentId } from '@beabee/beabee-common';
import { instance } from '.';
import type { Content } from '@type';

/** @deprecated Use the client instead */
export async function fetchContent<Id extends ContentId>(
  id: Id
): Promise<Content<Id>> {
  return (await instance.get('/content/' + id)).data;
}

/** @deprecated Use the client instead */
export async function updateContent<Id extends ContentId>(
  id: Id,
  content: Partial<Content<Id>>
): Promise<Content<Id>> {
  return (await instance.patch('/content/' + id, content)).data;
}
