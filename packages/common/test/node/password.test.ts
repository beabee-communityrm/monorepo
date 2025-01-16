import { describe, expect, test } from "vitest";
import { isPassword } from "@beabee/beabee-common";

describe("isPassword", () => {
  test("valid password", () => {
    expect(isPassword("Deposit-Rigging-3Bubbly")).toBe(true);
  });

  test("invalid password - only numbers", () => {
    expect(isPassword("123456")).toBe(false);
  });

  test("invalid password - less than 8 characters", () => {
    expect(isPassword("abc123")).toBe(false);
  });

  test("invalid password - no uppercase letters", () => {
    expect(isPassword("deposit-rigging-3bubbly")).toBe(false);
  });

  test("invalid password - no lowercase letters", () => {
    expect(isPassword("DEPOSIT-RIGGING-3BUBBLY")).toBe(false);
  });

  test("invalid password - no numbers", () => {
    expect(isPassword("Deposit-Rigging-Bubbly")).toBe(false);
  });
});
