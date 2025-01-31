#!/usr/bin/env node
import "./env.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { apiKeyCommand } from "./commands/api-key.js";
import { userCommand } from "./commands/user.js";
import { configureCommand } from "./commands/configure.js";
import { paymentCommand } from "./commands/payment.js";

const pkg = JSON.parse(
  readFileSync(resolve(process.cwd(), "./package.json"), "utf8")
);

yargs(hideBin(process.argv))
  .command(apiKeyCommand)
  .command(userCommand)
  .command(configureCommand)
  .command(paymentCommand)
  .demandCommand(1, "You need at least one command before moving on")
  .version(pkg.version)
  .scriptName("yarn backend-cli")
  .help()
  .parse();
