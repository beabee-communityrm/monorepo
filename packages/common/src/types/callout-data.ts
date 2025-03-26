import type { CalloutResponseViewSchema } from "./index.js";

import type {
  CalloutAccess,
  CalloutCaptcha,
  CalloutChannel
} from "../data/index.js";

export interface CalloutData {
  slug?: string;
  image: string;
  starts: Date | null;
  expires: Date | null;
  allowUpdate: boolean;
  allowMultiple: boolean;
  access: CalloutAccess;
  showNewsletterOptIn: boolean;
  captcha: CalloutCaptcha;
  hidden: boolean;
  responseViewSchema?: CalloutResponseViewSchema | null;
  channels: CalloutChannel[] | null;
}
