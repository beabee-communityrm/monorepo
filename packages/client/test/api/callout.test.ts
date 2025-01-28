import { describe, expect, test } from "vitest";
import { CalloutClient } from "@beabee/client";

import { API_KEY, HOST, PATH } from "./utils/env.js";

describe("CalloutClient", () => {
  const calloutClient = new CalloutClient({
    host: HOST,
    path: PATH,
    token: API_KEY
  });

  test("is a class", () => {
    expect(typeof CalloutClient).toBe("function");
  });

  test("has a get method", () => {
    expect("get" in calloutClient).toBeTruthy();
  });
});
