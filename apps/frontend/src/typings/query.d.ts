import '@tanstack/vue-query';

declare module '@tanstack/vue-query' {
  interface Register {
    queryMeta: {
      /** The title of a toast to show when the query fails */
      errorToast?: string;
    };
  }
}
