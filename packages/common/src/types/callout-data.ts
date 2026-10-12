import type {
  CalloutAccess,
  CalloutCaptcha,
  CalloutChannel,
  CalloutResponseMode,
} from '../data/index.js';
import type {
  CalloutNewsletterSchema,
  CalloutResponseViewSchema,
} from './index.js';

export interface CalloutData {
  slug?: string;
  image: string;
  starts: Date | null;
  expires: Date | null;
  responseMode: CalloutResponseMode;
  access: CalloutAccess;
  captcha: CalloutCaptcha;
  hidden: boolean;
  newsletterSchema?: CalloutNewsletterSchema | null;
  responseViewSchema?: CalloutResponseViewSchema | null;
  channels: CalloutChannel[] | null;
  sendResponseEmail: boolean;
}
