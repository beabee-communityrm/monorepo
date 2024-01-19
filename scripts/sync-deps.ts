// Sync NPM dependencies from package.json with Deno dependencies in deno.json.
import { parse } from "https://deno.land/std@0.212.0/jsonc/mod.ts";

// Load package.json
const packageJson = await Deno.readTextFile("./package.json");
const packageJsonObj = parse(packageJson) as any;

// Load deno.jsonc
const denoJsonc = await Deno.readTextFile("./deno.json");
const denoJsoncObj = parse(denoJsonc) as any;

// Get dependencies
const dependencies = packageJsonObj.dependencies as Record<string, string>;

for (const [name, _version] of Object.entries(dependencies)) {
  // Remove version prefix and suffix
  const version = _version.replace(/^[\^~><=\*]+|$/, "");

  // Add dependency to deno.jsonc
  denoJsoncObj.imports[name] = version
    ? `npm:${name}@${version}`
    : `npm:${name}`;
}

// Write deno.jsonc
const encoder = new TextEncoder();
const denoJsoncString = JSON.stringify(denoJsoncObj, null, 2);
await Deno.writeFile("./deno.json", encoder.encode(denoJsoncString));
