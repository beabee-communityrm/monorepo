let runtime = "";

export const getRuntime = async () => {
  if (runtime && runtime !== "Unknown") {
    return runtime;
  }

  if (globalThis.Deno?.version?.deno) {
    return "Deno " + globalThis.Deno?.version?.deno;
  } else {
    let process = (globalThis as any).process;

    if (!process) {
      try {
        process = await import("process");
      } catch (error) {
        console.error(error);
        console.warn(error.message);
        runtime = "Unknown";
      }
    }

    if (process?.versions?.gjs) {
      runtime = "Gjs " + process.versions.gjs;
    } else if (process?.versions?.node) {
      runtime = "Node.js " + process.versions.node;
    }
  }
  return runtime || "Unknown";
};
