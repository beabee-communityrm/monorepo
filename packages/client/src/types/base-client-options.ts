import type { FetchOptions } from "./fetch-options";

export interface BaseClientOptions extends FetchOptions {
  path?: string;
}
