import type { CalloutResponseAnswers } from '@beabee/beabee-common';

import type {
  Noop,
  GetContactData,
  GetCalloutResponseWith,
  GetCalloutData,
  GetCalloutResponseCommentData,
  GetCalloutResponseData,
} from '@type';

export type GetCalloutResponseDataWith<With extends GetCalloutResponseWith> =
  GetCalloutResponseData &
    ('answers' extends With ? { answers: CalloutResponseAnswers } : Noop) &
    ('assignee' extends With ? { assignee: GetContactData | null } : Noop) &
    ('callout' extends With ? { callout: GetCalloutData } : Noop) &
    ('contact' extends With ? { contact: GetContactData | null } : Noop) &
    ('latestComment' extends With
      ? { latestComment: GetCalloutResponseCommentData | null }
      : Noop) &
    ('tags' extends With ? { tags: { id: string; name: string }[] } : Noop);
