import { TagClient } from "./tag.client.ts";

export class CalloutTagClient extends TagClient {
  getBasePath(entityId: string | undefined): string {
    return `/callout/${entityId}/tags`;
  }
}
