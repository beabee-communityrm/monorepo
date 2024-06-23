// Simple CLI wrapper to run the Deno CLI with Node.js
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cwd = process.cwd();

const cliPath = join(__dirname, "src/cli.ts");
const denoArgs =
  "run --allow-read --allow-write --allow-env --allow-run --allow-net " +
  cliPath;
const args = process.argv.slice(2);

const child = spawn("deno", [...denoArgs.split(" "), ...args], {
  env: { ...process.env, CURRENT_DIR: cwd },
});

child.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

child.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});
