import { BaseClient } from "./base-client.ts";
import { CalloutClient } from "./callout-client.ts";
import { ContentClient } from "./content-client.ts";

import type { BaseClientOptions } from "../types/index.ts";

export class BeabeeClient extends BaseClient {
    content: ContentClient;
    callout: CalloutClient;
    constructor(protected override readonly options: BaseClientOptions) {
        super(options);
        this.content = new ContentClient(options);
        this.callout = new CalloutClient(options);
    }
}
