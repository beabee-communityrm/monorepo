export interface FetchResponse<T> extends Response {
  data: T;
}
