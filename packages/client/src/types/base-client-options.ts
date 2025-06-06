import type { FetchOptions } from './fetch-options.js';

export interface BaseClientOptions extends FetchOptions {
  path?: string;
}
