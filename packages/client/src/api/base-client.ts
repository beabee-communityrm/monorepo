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

  protected deserializeDate(s: string): Date;
  protected deserializeDate<T extends null | undefined>(
    s: string | T,
  ): Date | T;
  protected deserializeDate<T extends null | undefined>(
    s: string | T,
  ): Date | T {
    return s == null ? s : parseISO(s);
  }
}
