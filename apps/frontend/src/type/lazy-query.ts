import type { ComputedRef, Ref } from 'vue';

/** A block's view of a route query, from `useLazyQuery` */
export interface LazyQuery<TData> {
  /** The loaded data, held back while a skeleton is still showing */
  data: ComputedRef<TData | undefined>;
  /** Whether to show a skeleton: whenever there's neither data nor an error */
  skeleton: Ref<boolean>;
  /** Whether the last finished load failed */
  failed: Readonly<Ref<boolean>>;
  /** Loads the data again; rejects if it still fails */
  retry: () => Promise<void>;
}
