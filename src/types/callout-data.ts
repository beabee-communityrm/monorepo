import type { CalloutResponseViewSchema } from "./index.ts";

import type { CalloutAccess, CalloutCaptcha, CalloutChannel } from "../data/index.ts";

export interface CalloutData {
  slug?: string;
  image: string;
  starts: Date | null;
  expires: Date | null;
  allowUpdate: boolean;
  allowMultiple: boolean;
  access: CalloutAccess;
  captcha: CalloutCaptcha;
  hidden: boolean;
  responseViewSchema?: CalloutResponseViewSchema | null;
  channels: CalloutChannel[] | null;
}
