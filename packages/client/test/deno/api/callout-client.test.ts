import { CalloutClient } from "../../../src/api/callout.client.ts";
import { assert, assertEquals } from "std/assert/mod.ts";

Deno.test("CalloutClient is a class and has a get method", () => {
  const calloutClient = new CalloutClient({
    host: "http://localhost:8080",
    token: "test",
  });

  // Check if CalloutClient is a class
  assertEquals(typeof CalloutClient, "function");

  // Check if get method exists
  assert("get" in calloutClient);
});
