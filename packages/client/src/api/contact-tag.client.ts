import { TagClient } from "./tag.client.ts";

export class ContactTagClient extends TagClient {
  getBasePath(contactId: string | undefined): string {
    if (contactId) {
      throw new Error("Contact ID is not supported");
    }
    return "/contact-tags";
  }
}
