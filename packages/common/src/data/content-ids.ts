import type { ContentId } from "../types/index.ts";

/** All possible strings that can be passed to the content get controller to retrieve Beabee content data */
export const contentIds: readonly ContentId[] = [
  "contacts",
  "email",
  "general",
  "join",
  "join/setup",
  "profile",
  "share",
  "payment",
  "telegram",
] as const satisfies ContentId[];
