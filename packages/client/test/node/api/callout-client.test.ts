import { CalloutClient } from "@beabee/client";
import { describe, expect, test } from "@jest/globals";

describe("CalloutClient", () => {
  const calloutClient = new CalloutClient({
    host: "http://localhost:8080",
    token: "test",
    path: "/api/1.0"
  });

  test("is a class", () => {
    expect(typeof CalloutClient).toBe("function");
  });

  test("has a get method", () => {
    expect("get" in calloutClient).toBeTruthy();
  });
});
