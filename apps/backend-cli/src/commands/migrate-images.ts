import { Argv } from "yargs";
import { migrateImages } from "../actions/migrate-images/migrate-images.js";

export interface MigrateImagesArgs {
  source: string;
  bucket: string;
  endpoint: string;
  accessKey: string;
  secretKey: string;
  region: string;
  dryRun: boolean;
  createVariants: boolean;
  preserveFormat: boolean;
}

/**
 * This command is used to migrate images from local storage to MinIO.
 * It is used to migrate images from the old PictShare storage to the new MinIO storage.
 * It is a temporary command and will be removed once all instances have been successfully migrated.
 */
export const migrateImagesCommand = {
  command: "migrate-images",
  describe: "Migrate images from local storage to MinIO",
  builder: (yargs: Argv): Argv<MigrateImagesArgs> => {
    return yargs
      .option("source", {
        describe: "Source directory containing images to migrate",
        type: "string",
        demandOption: true
      })
      .option("bucket", {
        describe: "Name of the MinIO bucket to upload images to",
        type: "string",
        demandOption: true
      })
      .option("endpoint", {
        describe: "MinIO endpoint URL (e.g., http://minio:9000)",
        type: "string",
        demandOption: true
      })
      .option("accessKey", {
        describe: "MinIO access key",
        type: "string",
        demandOption: true
      })
      .option("secretKey", {
        describe: "MinIO secret key",
        type: "string",
        demandOption: true
      })
      .option("region", {
        describe: "MinIO region",
        type: "string",
        default: "us-east-1"
      })
      .option("dryRun", {
        describe: "Simulate migration without actually uploading files",
        type: "boolean",
        default: false
      })
      .option("createVariants", {
        describe: "Create image variants (resized versions) during migration",
        type: "boolean",
        default: true
      })
      .option("preserveFormat", {
        describe:
          "Preserve original image format instead of converting to AVIF",
        type: "boolean",
        default: true
      });
  },
  handler: async (args: MigrateImagesArgs): Promise<void> => {
    try {
      await migrateImages({
        source: args.source,
        bucket: args.bucket,
        endpoint: args.endpoint,
        accessKey: args.accessKey,
        secretKey: args.secretKey,
        region: args.region,
        dryRun: args.dryRun,
        createVariants: args.createVariants,
        preserveFormat: args.preserveFormat
      });
    } catch (error) {
      console.error("Failed to migrate images:", error);
      process.exit(1);
    }
  }
};
