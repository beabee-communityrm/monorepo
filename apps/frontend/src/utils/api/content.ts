import { instance } from '.';
import type { ContentId, Content } from '@type';

export async function fetchContent<Id extends ContentId>(
  id: Id
): Promise<Content<Id>> {
  return (await instance.get('/content/' + id)).data;
}

export async function updateContent<Id extends ContentId>(
  id: Id,
  content: Partial<Content<Id>>
): Promise<Content<Id>> {
  return (await instance.patch('/content/' + id, content)).data;
}
