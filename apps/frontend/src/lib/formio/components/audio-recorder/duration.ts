export const DEFAULT_MAX_DURATION_S = 3 * 60;
// Comfortably under the 20MB global upload cap at typical opus bitrates.
export const MAX_DURATION_LIMIT_S = 15 * 60;

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

/** Parses "m:ss" into seconds */
export function parseDuration(value: unknown): number | undefined {
  const match =
    typeof value === 'string' && /^(\d{1,2}):([0-5]\d)$/.exec(value.trim());
  return match ? Number(match[1]) * 60 + Number(match[2]) : undefined;
}
