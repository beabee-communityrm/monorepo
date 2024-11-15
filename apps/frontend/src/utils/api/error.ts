import axios from 'axios';
import type { ApiRequestError } from '@type/api-request-error';
import type { ApiError } from '@type/api-error';

export function isRequestError<Code extends string>(
  err: unknown,
  codes?: Code[]
): err is ApiRequestError<Code, 400>;
export function isRequestError<Code extends string, Status extends number>(
  err: unknown,
  codes: Code[] | undefined,
  status: Status[]
): err is ApiRequestError<Code, Status>;
export function isRequestError<Code extends string, Status extends number>(
  err: unknown,
  codes: string[] = [],
  status: Status[] = [400] as Status[]
): err is ApiRequestError<Code, Status> {
  if (
    axios.isAxiosError(err) &&
    typeof err.response?.status === 'number' &&
    status.includes(err.response.status as Status)
  ) {
    const data = err.response.data as ApiError<Code>;
    return !codes.length || codes.includes(data.code);
  }

  return false;
}
