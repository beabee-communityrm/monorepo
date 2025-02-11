import {
  CalloutResponseAnswersSlide,
  GetCalloutResponseWith
} from "../index.js";
import type {
  GetCalloutData,
  GetCalloutResponseCommentData,
  GetCalloutResponseData,
  GetContactData,
  Noop
} from "./index.js";

export type GetCalloutResponseDataWith<
  With extends GetCalloutResponseWith | void
> = GetCalloutResponseData &
  (GetCalloutResponseWith.Answers extends With
    ? { answers: CalloutResponseAnswersSlide }
    : Noop) &
  (GetCalloutResponseWith.Assignee extends With
    ? { assignee: GetContactData | null }
    : Noop) &
  (GetCalloutResponseWith.Callout extends With
    ? { callout: GetCalloutData }
    : Noop) &
  (GetCalloutResponseWith.Contact extends With
    ? { contact: GetContactData | null }
    : Noop) &
  (GetCalloutResponseWith.LatestComment extends With
    ? { latestComment: GetCalloutResponseCommentData | null }
    : Noop) &
  (GetCalloutResponseWith.Tags extends With
    ? { tags: { id: string; name: string }[] }
    : Noop);
