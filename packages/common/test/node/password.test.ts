import { assert } from "https://deno.land/std@0.212.0/assert/assert.ts";
import { isPassword } from "../../mod.ts";

Deno.test("isPassword", async (t) => {
  // Test case for a valid password
  await t.step("valid password", function () {
    assert(
      isPassword("Deposit-Rigging-3Bubbly"),
      "Expected password to be valid",
    );
  });

  // Test case for an invalid password (only numbers)
  await t.step("invalid password - only numbers", function () {
    assert(!isPassword("123456"), "Expected password to be invalid");
  });

  // Test case for an invalid password (less than 8 characters)
  await t.step("invalid password - less than 8 characters", function () {
    assert(!isPassword("abc123"), "Expected password to be invalid");
  });

  // Test case for an invalid password (no uppercase letters)
  await t.step("invalid password - no uppercase letters", function () {
    assert(
      !isPassword("deposit-rigging-3bubbly"),
      "Expected password to be invalid",
    );
  });

  // Test case for an invalid password (no lowercase letters)
  await t.step("invalid password - no lowercase letters", function () {
    assert(
      !isPassword("DEPOSIT-RIGGING-3BUBBLY"),
      "Expected password to be invalid",
    );
  });

  // Test case for an invalid password (no numbers)
  await t.step("invalid password - no numbers", function () {
    assert(
      !isPassword("Deposit-Rigging-Bubbly"),
      "Expected password to be invalid",
    );
  });
});
