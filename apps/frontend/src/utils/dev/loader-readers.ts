/**
 * Which components read each route loader's data, so `DevRequestBar` can
 * outline them for the loader's requests, which come from the router rather
 * than a component. Recorded in development only. Kept apart from the rest of
 * the dev bar, as the code that records readers is in production builds too.
 */
import { getCurrentInstance } from 'vue';

const readers = new Map<unknown, Set<string>>();

/**
 * Records the current component as one that reads a loader's data
 *
 * @param data The loader's data ref, which identifies the loader
 */
export function trackLoaderReader(data: unknown) {
  if (!import.meta.env.DEV) return;
  const file = getCurrentInstance()?.type.__file;
  if (!file) return;
  const files = readers.get(data) ?? new Set<string>();
  files.add(file);
  readers.set(data, files);
}

/**
 * Records the current component as one that reads a route query
 *
 * @param hash The query's hashed key
 */
export const trackQueryReader = (hash: string) => trackLoaderReader(hash);

/** The files of the components that read a loader's data or a route query,
 * by its data ref or hashed key */
export const loaderReaders = (data: unknown) => [...(readers.get(data) ?? [])];
