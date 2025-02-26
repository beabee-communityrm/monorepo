export interface FetchResponse<T> extends globalThis.Response {
  data: T;
}
