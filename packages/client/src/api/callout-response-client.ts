import { BaseClient } from "./base-client.ts";
import { cleanUrl } from "../utils/index.ts";

import type { BaseClientOptions } from "../types/index.ts";

import type { CreateCalloutResponseData } from "../deps.ts";

export class CalloutResponseClient extends BaseClient {
  constructor(protected readonly options: BaseClientOptions) {
    // e.g. `/api/1.0/callout`
    options.path = cleanUrl(options.path + "/callout");
    super(options);
  }

  /**
   * Create a callout response
   * @param slug The slug of the callout to create the response for
   * @param newData The data to create the callout response with
   * @returns The created callout response
   */
  async create(
    slug: string,
    newData: Pick<
      CreateCalloutResponseData,
      "answers" | "guestEmail" | "guestName"
    >,
  ) {
    const response = await this.fetch.post<void>(
      `/${slug}/responses`,
      {
        answers: newData.answers,
        guestName: newData.guestName,
        guestEmail: newData.guestEmail,
      },
    );
    return response;
  }
}
