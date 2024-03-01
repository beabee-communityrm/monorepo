// Sync runtime configurations between package.json and deno.json.

import { parse } from "https://deno.land/std@0.212.0/jsonc/mod.ts";

// Load package.json
const packageJson = await Deno.readTextFile("./package.json");
const packageJsonObj = parse(packageJson) as any;

// Load deno.jsonc
const denoJsonc = await Deno.readTextFile("./deno.json");
const denoJsoncObj = parse(denoJsonc) as any;

/** Sync NPM dependencies from package.json with Deno dependencies in deno.json. */
const syncDependencies = async () => {
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
};

/** Sync NPM scripts from package.json with Deno tasks in deno.json. */
const syncScripts = () => {
  const nodeScripts = packageJsonObj.scripts as Record<string, string>;
  const denoScripts = denoJsoncObj.tasks as Record<string, string>;

  // Array of script names without duplicates
  const scriptNames = [
    ...new Set([...Object.keys(nodeScripts), ...Object.keys(denoScripts)]),
  ];

  for (const scriptName of scriptNames) {
    let isDenoWrap = false;
    let isNodeWrap = false;
    let isNode = false;
    let isDeno = false;

    if (denoScripts[scriptName]?.startsWith("deno task")) {
      isDenoWrap = true;
    } else if (denoScripts[scriptName]?.startsWith("deno ")) {
      isDeno = true;
    }

    if (nodeScripts[scriptName]?.startsWith("npm run")) {
      isNodeWrap = true;
    } else if (nodeScripts[scriptName]?.startsWith("node ")) {
      isNode = true;
    }

    if (isDeno) {
      nodeScripts[scriptName] = `deno task ${scriptName}`;
    } else if (isNode) {
      denoScripts[scriptName] = `npm run ${scriptName}`;
    } else if (isDenoWrap && isNodeWrap) {
      console.debug(`Leave the script "${scriptName}" as it is for both`);
    } else if (isDenoWrap) {
      nodeScripts[scriptName] = `deno task ${scriptName}`;
    } else if (isNodeWrap) {
      denoScripts[scriptName] = `npm run ${scriptName}`;
    } else if (!nodeScripts[scriptName]) {
      nodeScripts[scriptName] = `deno task ${scriptName}`;
    } else if (!denoScripts[scriptName]) {
      denoScripts[scriptName] = `npm run ${scriptName}`;
    }
  }
};

const writeToFile = async () => {
  const encoder = new TextEncoder();

  // Write deno.jsonc
  const denoJsoncString = JSON.stringify(denoJsoncObj, null, 2) + "\n";
  await Deno.writeFile("./deno.json", encoder.encode(denoJsoncString));

  // Write package.json
  const packageJsonString = JSON.stringify(packageJsonObj, null, 2) + "\n";
  await Deno.writeFile("./package.json", encoder.encode(packageJsonString));
};

await syncDependencies();
await syncScripts();
await writeToFile();
