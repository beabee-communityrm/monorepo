import type { TagData } from "./tag-data.ts";

export type TagCreateData = Pick<TagData, "name" | "description">;
