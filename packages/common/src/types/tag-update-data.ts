import { TagCreateData } from "./index.js";

// Name is required, the rest is optional
export type TagUpdateData = Partial<TagCreateData> &
  Pick<TagCreateData, "name">;
