// TypeORM's QueryDeepPartialEntity is not accessible via subpath imports in ESM.
// This is a local equivalent used for TypeORM update() calls.
export type QueryDeepPartialEntity<T> = {
  [P in keyof T]?:
    | (T[P] extends Array<infer U>
        ? Array<QueryDeepPartialEntity<U>>
        : T[P] extends ReadonlyArray<infer U>
          ? ReadonlyArray<QueryDeepPartialEntity<U>>
          : QueryDeepPartialEntity<T[P]>)
    | (() => string);
};
