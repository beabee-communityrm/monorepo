import type { CommandModule, ArgumentsCamelCase } from "yargs";
import { processGifts } from "../actions/process/gifts.js";
import type { ProcessGiftsArgs } from "../types/process.js";

export const processCommand: CommandModule = {
  command: "process <action>",
  describe: "Processing commands",
  builder: (yargs) =>
    yargs.command({
      command: "gifts",
      describe: "Process pending gifts",
      builder: (yargs) =>
        yargs
          .option("date", {
            type: "string",
            description: "Process gifts for specific date (ISO format)",
            default: new Date().toISOString()
          })
          .option("dryRun", {
            type: "boolean",
            description: "Run without making changes",
            default: false
          }),
      handler: (argv: ArgumentsCamelCase<ProcessGiftsArgs>) =>
        processGifts(argv)
    }),
  handler: () => {}
};
