import type { CommandModule, Argv } from "yargs";
import { createUser } from "../actions/user/create.js";
import type { CreateUserArgs } from "../types/index.js";
import type { ArgumentsCamelCase } from "yargs";

export const userCommand: CommandModule = {
  command: "user <action>",
  describe: "Manage users",
  builder: (yargs) => {
    return yargs.command({
      command: "create",
      describe: "Create a new user",
      builder: (yargs) => {
        return yargs
          .option("firstname", {
            alias: "f",
            type: "string",
            describe: "First name",
            demandOption: true
          })
          .option("lastname", {
            alias: "l",
            type: "string",
            describe: "Last name",
            demandOption: true
          })
          .option("email", {
            alias: "e",
            type: "string",
            describe: "Email address",
            demandOption: true
          })
          .option("password", {
            alias: "p",
            type: "string",
            describe: "Password (leave empty to generate reset password link)",
            default: ""
          })
          .option("membership", {
            alias: "m",
            describe: "Membership type",
            choices: ["none", "permanent", "monthly", "expired"],
            default: "permanent"
          })
          .option("role", {
            alias: "r",
            describe: "User role",
            choices: ["none", "admin", "superadmin"],
            default: "superadmin"
          }) as Argv<CreateUserArgs>;
      },
      handler: (argv: ArgumentsCamelCase<CreateUserArgs>) => createUser(argv)
    });
  },
  handler: () => {}
};
