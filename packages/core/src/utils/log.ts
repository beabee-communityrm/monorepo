import axios, { AxiosError } from 'axios';
import winston from 'winston';

const MAX_LOGGED_BODY_LENGTH = 1024;

/**
 * Turn a response body into a string short enough to log.
 *
 * @param data The response body
 * @returns The body as a string, cut to about 1 KB
 */
export function truncateForLog(data: unknown): string | undefined {
  if (data === undefined) return undefined;
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return str.length > MAX_LOGGED_BODY_LENGTH
    ? str.slice(0, MAX_LOGGED_BODY_LENGTH) + '…'
    : str;
}

/**
 * The parts of an axios error that are safe to log. Leaves out the request
 * config and headers, which carry API keys and bearer tokens, and the query
 * string, which can too.
 *
 * @param error The axios error
 * @returns A summary of the failed request
 */
export function summarizeAxiosError(error: AxiosError) {
  const url = error.config && axios.getUri(error.config).split('?')[0];
  return {
    method: error.config?.method?.toUpperCase(),
    url,
    status: error.response?.status,
    code: error.code,
    data: truncateForLog(error.response?.data),
  };
}

/**
 * Winston format that reduces axios errors to a safe summary, whether the error
 * was passed as the log metadata (winston spreads its properties into the log
 * entry) or nested one level inside it.
 */
export const axiosErrorFormat = winston.format((info) => {
  // Build a new entry: for log.error(err) the entry is the error object itself,
  // which the caller may still use after logging
  const { isAxiosError, config, request, response, status, ...rest } = info;
  const out: winston.Logform.TransformableInfo = isAxiosError
    ? {
        ...rest,
        stack: info.stack,
        // The entry has the axios error's own properties
        ...summarizeAxiosError(info as unknown as AxiosError),
      }
    : { ...info };
  for (const [key, value] of Object.entries(out)) {
    if (axios.isAxiosError(value)) {
      out[key] = { message: value.message, ...summarizeAxiosError(value) };
    }
  }
  return out;
});
