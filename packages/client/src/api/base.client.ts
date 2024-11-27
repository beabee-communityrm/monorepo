import { Fetch, parseISO } from "../utils/index.ts";
import type { BaseClientOptions } from "../types/index.ts";

export abstract class BaseClient {
  protected readonly fetch: Fetch;

  constructor(protected readonly options: BaseClientOptions) {
    this.fetch = new Fetch({
      basePath: options.path,
      host: options.host,
      token: options.token,
    });
  }

  static deserializeDate(s: string | Date): Date;
  static deserializeDate<T extends null | undefined>(
    s: string | Date | T,
  ): Date | T;
  static deserializeDate<T extends null | undefined>(
    s: string | Date | T,
  ): Date | T {
    if (s instanceof Date) {
      return s;
    }
    return s == null ? s : parseISO(s);
  }
}
