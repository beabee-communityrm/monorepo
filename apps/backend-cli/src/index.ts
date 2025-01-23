#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { apiKeyCommand } from "./commands/api-key.js";
import { userCommand } from "./commands/user.js";
import { configureCommand } from "./commands/configure.js";

yargs(hideBin(process.argv))
  .command(apiKeyCommand)
  .command(userCommand)
  .command(configureCommand)
  .demandCommand(1, "You need at least one command before moving on")
  .help().argv;
