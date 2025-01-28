import type { CommandModule } from "yargs";

export const configureCommand: CommandModule = {
  command: "configure",
  describe: "Configure system settings",
  handler: () => {
    console.log(
      "Not implemented yet. Currently available in apps/backend/src/tools/configure.ts"
    );
  }
};
