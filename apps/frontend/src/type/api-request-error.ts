import type { ApiError } from '@type/api-error';
import type { AxiosError, AxiosResponse } from 'axios';

export type ApiRequestError<
  Code extends string = string,
  Status extends number = number,
> = AxiosError & {
  response: AxiosResponse<ApiError<Code>> & {
    status: Status;
  };
};
