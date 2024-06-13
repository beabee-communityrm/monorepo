import { database } from "#core/database";

import { optionsService } from "#core/services/OptionsService";

import { PageSettings } from "@beabee/models";

interface PageSettingsCache extends PageSettings {
  patternRegex: RegExp;
}

export type JustPageSettings = Omit<PageSettings, "id" | "pattern">;

export class PageSettingsService {
  private static pathCache: Record<string, JustPageSettings | "default"> = {};
  private static psCache: PageSettingsCache[] = [];

  static getPath(path: string): JustPageSettings {
    let cache = this.pathCache[path];
    if (cache === undefined) {
      cache = this.pathCache[path] =
        this.psCache.find((ps) => ps.patternRegex.test(path)) || "default";
    }
    return cache === "default"
      ? {
          shareUrl: "/",
          shareTitle: optionsService.getText("share-title"),
          shareDescription: optionsService.getText("share-description"),
          shareImage: optionsService.getText("share-image")
        }
      : cache;
  }

  static async reload(): Promise<void> {
    this.psCache = (await database.getRepository(PageSettings).find()).map(
      (ps) => ({
        ...ps,
        patternRegex: new RegExp(ps.pattern)
      })
    );
    this.pathCache = {};
  }

  static async create(ps: PageSettings): Promise<PageSettings> {
    const savedPs = await database.getRepository(PageSettings).save(ps);
    await this.reload();
    return savedPs;
  }

  static async update(
    ps: PageSettings,
    fields: Partial<PageSettings>
  ): Promise<void> {
    await database.getRepository(PageSettings).update(ps.id, fields);
    await this.reload();
  }

  static async delete(ps: PageSettings): Promise<void> {
    await database.getRepository(PageSettings).delete(ps.id);
    await this.reload();
  }
}
