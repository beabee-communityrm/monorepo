import type { AxiosError, AxiosResponse } from 'axios';
import type { ApiError } from '@type/api-error';

export type ApiRequestError<
  Code extends string = string,
  Status extends number = number,
> = AxiosError & {
  response: AxiosResponse<ApiError<Code>> & {
    status: Status;
  };
};
