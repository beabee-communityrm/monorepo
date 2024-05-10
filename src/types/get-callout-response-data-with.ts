import type {
  CalloutResponseAnswers,
  GetCalloutData,
  GetCalloutResponseCommentData,
  GetCalloutResponseData,
  GetCalloutResponseWith,
  GetContactData,
  Noop,
} from "./index.ts";

export type GetCalloutResponseDataWith<With extends GetCalloutResponseWith> =
  & GetCalloutResponseData
  & ("answers" extends With ? { answers: CalloutResponseAnswers }
    : Noop)
  & ("assignee" extends With ? { assignee: GetContactData | null } : Noop)
  & ("callout" extends With ? { callout: GetCalloutData } : Noop)
  & ("contact" extends With ? { contact: GetContactData | null } : Noop)
  & ("latestComment" extends With
    ? { latestComment: GetCalloutResponseCommentData | null }
    : Noop)
  & ("tags" extends With ? { tags: { id: string; name: string }[] } : Noop);
