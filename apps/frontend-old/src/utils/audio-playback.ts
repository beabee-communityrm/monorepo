// Shared by the audio recorder's playback and the response card's player,
// which render differently but should agree on the waveform and the numbers
import { formatTime } from '../lib/formio/components/audio-recorder/duration';

export const WAVEFORM_BAR_COUNT = 64;

/**
 * A file size in KB, or in MB from 1000 KB
 *
 * @param bytes - The size in bytes
 * @returns The size, e.g. "605 KB"
 */
export function formatSize(bytes: number): string {
  const kb = Math.max(1, Math.round(bytes / 1024));
  return kb > 999 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB';
}

/**
 * A deterministic pseudo-random waveform, for audio with no captured samples:
 * an uploaded file, or a saved answer being shown again
 *
 * @param seed - Usually the file's name, so the same file always looks the same
 * @returns One peak per bar, between 0 and 1
 */
export function fakePeaks(seed: string): number[] {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n += seed.charCodeAt(i);
  return Array.from({ length: WAVEFORM_BAR_COUNT }, (_, i) => {
    n = (n * 1103515245 + 12345) % 2147483648;
    return 0.2 + (n / 2147483648) * 0.8 * (0.55 + 0.45 * Math.sin(i / 5));
  });
}

/**
 * The height of each playback bar
 *
 * @param peaks - Peaks between 0 and 1, resampled to the bar count
 * @returns One height in pixels per bar
 */
export function waveformBarHeights(peaks: number[]): number[] {
  return Array.from({ length: WAVEFORM_BAR_COUNT }, (_, i) => {
    const peak = peaks.length
      ? peaks[Math.floor((i * peaks.length) / WAVEFORM_BAR_COUNT)]
      : 0.35;
    return Math.max(3, Math.min(48, peak * 110));
  });
}

/**
 * Whether playback has reached a bar
 *
 * @param index - The bar's position
 * @param currentTime - Seconds played
 * @param duration - The length in seconds
 * @returns True once the bar should show as played
 */
export function isBarPlayed(
  index: number,
  currentTime: number,
  duration: number
): boolean {
  return index / WAVEFORM_BAR_COUNT <= currentTime / (duration || 1);
}

/**
 * The time to show beside the waveform: how far playback has got, or the
 * length before it starts
 *
 * @param playing - Whether the audio is playing
 * @param currentTime - Seconds played
 * @param duration - The length in seconds
 * @returns The time, e.g. "0:12"
 */
export function formatPlaybackTime(
  playing: boolean,
  currentTime: number,
  duration: number
): string {
  return formatTime(playing || currentTime ? currentTime : duration);
}

/**
 * The length and size of a file, whichever are known
 *
 * @param duration - The length in seconds
 * @param size - The size in bytes
 * @returns The two joined, e.g. "0:12 · 605 KB"
 */
export function formatAudioMeta(duration?: number, size?: number): string {
  return [
    duration !== undefined && formatTime(duration),
    size !== undefined && formatSize(size),
  ]
    .filter(Boolean)
    .join(' · ');
}
