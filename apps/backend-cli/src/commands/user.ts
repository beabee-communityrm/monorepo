import type { CommandModule } from "yargs";

export const userCommand: CommandModule = {
  command: "user <action>",
  describe: "Manage users",
  builder: (yargs) => {
    return yargs.command({
      command: "create",
      describe: "Create a new user",
      handler: () => {
        console.log(
          "Not implemented yet. Currently available in apps/backend/src/tools/new-user.ts"
        );
      }
    });
  },
  handler: () => {}
};
