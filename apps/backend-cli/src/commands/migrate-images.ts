import { Argv } from "yargs";
import { migrateImages } from "../actions/migrate-images/migrate-images.js";

export interface MigrateImagesArgs {
  source: string;
  dryRun: boolean;
}

/**
 * This command is used to migrate images from local storage to MinIO.
 * It is used to migrate images from the old PictShare storage to the new MinIO storage via ImageService.
 * It is a temporary command and will be removed once all instances have been successfully migrated.
 */
export const migrateImagesCommand = {
  command: "migrate-images",
  describe: "Migrate images from local storage to MinIO using ImageService",
  builder: (yargs: Argv): Argv<MigrateImagesArgs> => {
    return yargs
      .option("source", {
        describe: "Source directory containing images to migrate",
        type: "string",
        demandOption: true
      })
      .option("dryRun", {
        describe: "Simulate migration without actually uploading files",
        type: "boolean",
        default: false
      });
  },
  handler: async (args: MigrateImagesArgs): Promise<void> => {
    try {
      await migrateImages({
        source: args.source,
        dryRun: args.dryRun
      });
    } catch (error) {
      console.error("Failed to migrate images:", error);
      process.exit(1);
    }
  }
};
