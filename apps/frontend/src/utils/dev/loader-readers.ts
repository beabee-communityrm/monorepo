/**
 * Which components read each route loader's data, so `DevRequestBar` can
 * outline them for the loader's requests, which come from the router rather
 * than a component. Recorded in development only. Kept apart from the rest of
 * the dev bar, as the code that records readers is in production builds too.
 */
import { getCurrentInstance } from 'vue';

const readers = new WeakMap<object, Set<string>>();

/**
 * Records the current component as one that reads a loader's data
 *
 * @param data The loader's data ref, which identifies the loader
 */
export function trackLoaderReader(data: object) {
  if (!import.meta.env.DEV) return;
  const file = getCurrentInstance()?.type.__file;
  if (!file) return;
  const files = readers.get(data) ?? new Set<string>();
  files.add(file);
  readers.set(data, files);
}

/** The files of the components that read a loader's data */
export const loaderReaders = (data: object) => [...(readers.get(data) ?? [])];
