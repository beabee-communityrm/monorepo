/**
 * The timings of loading pages, in milliseconds. Under `barDelay`, a page
 * arrives with nothing in between. Up to `hold`, the loading bar shows while
 * the previous page stays up. After that, the page shows with skeletons in
 * place of what's still loading, for at least `skeletonMinimum`.
 */
export const LOADING = {
  /** A navigation shows the loading bar once it's taken this long */
  barDelay: 150,
  /** How often the loading bar creeps forward */
  barStep: 200,
  /** The full loading bar stays this long before fading */
  barFilled: 200,
  /** The page waits this long for its data, counted from when its loads
   * start, then shows with skeletons for what's still loading */
  hold: 300,
  /** A skeleton, once shown, stays at least this long, so it doesn't flash */
  skeletonMinimum: 400,
} as const;
