import { log as mainLogger } from "@beabee/core/logging";
import { SyncSegmentsArgs } from "../../types/sync.js";

const log = mainLogger.child({ app: "process-segments" });

export const syncSegments = async (args: SyncSegmentsArgs): Promise<void> => {
  // TODO: We need to use the ContactTransformer to fetch the contacts,
  // but this is only available in the backend.
  // See https://github.com/beabee-communityrm/monorepo/pull/145
  throw new Error("Not implemented");
};
