import type { NetworkService } from './network-service.js';

export interface NetworkServiceMap {
  [name: string]: NetworkService;
}
