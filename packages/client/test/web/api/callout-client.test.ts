import "@beabee/client";
import { describe, expect, test } from "@jest/globals";

describe("CalloutClient", () => {
  const calloutClient = new Beabee.Client.CalloutClient({
    host: "http://localhost:8080",
    token: "test",
  });

  test("is a class", () => {
    expect(typeof Beabee.Client.CalloutClient).toBe("function");
  });

  test("has a get method", () => {
    expect("get" in calloutClient).toBeTruthy();
  });
});
