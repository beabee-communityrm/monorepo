import type { DevRequestMode } from './dev-request-mode';

/** The requests made by one Alt-click, held until an outcome is picked */
export interface DevRequestHold {
  id: number;
  /** Requests held, as "METHOD /path?query" */
  keys: string[];
  /** Where the clicked element is, to show the hold next to it */
  top: number;
  left: number;
  /** Lets every held request carry on with the given outcome */
  settle: (mode: Exclude<DevRequestMode, 'hang'>) => void;
}
