import type { AxiosResponse } from 'axios';

import type { MCMember } from './mc-member.js';

interface UpsertMCMemberResponseBadRequest extends AxiosResponse {
  status: 400;
  data:
    | {
        title: string;
      }
    | undefined;
}

interface UpsertMCMemberResponseSuccess extends AxiosResponse {
  status: 200;
  data: MCMember;
}

interface UpsertMCMemberResponseError extends AxiosResponse {
  status: 500; // This should really be all statuses except 200 and 400
}

export type UpsertMCMemberResponse =
  | UpsertMCMemberResponseBadRequest
  | UpsertMCMemberResponseSuccess
  | UpsertMCMemberResponseError;
