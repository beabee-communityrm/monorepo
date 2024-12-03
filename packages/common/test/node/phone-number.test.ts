import { assert } from "https://deno.land/std@0.212.0/assert/assert.ts";
import { toPhoneNumber } from "../../mod.ts";

Deno.test("toPhoneNumber", async (t) => {
  // Test case for a valid phone numbers
  await t.step("valid phone number starting with +", function () {
    assert(
      toPhoneNumber("+1234567890") !== false,
      "Expected phone number to be valid",
    );
  });

  await t.step("valid phone number starting with 0", function () {
    assert(
      toPhoneNumber("01234567890") !== false,
      "Expected phone number to be valid",
    );
  });

  // Test case for a valid phone number with country code and spaces
  await t.step("valid phone number with country code and spaces", function () {
    assert(
      toPhoneNumber("+1 234 567 890") !== false,
      "Expected phone number to be valid",
    );
  });

  // Test case for a valid phone number with country code and dashes
  await t.step("valid phone number with country code and dashes", function () {
    assert(
      toPhoneNumber("+1-234-567-890") !== false,
      "Expected phone number to be valid",
    );
  });

  // Test case for a valid phone number with parentheses
  await t.step("valid phone number with parentheses", function () {
    assert(
      toPhoneNumber("(123) 456-7890") !== false,
      "Expected phone number to be valid",
    );
  });

  // Test case for a valid phone number with country code, parentheses and spaces
  await t.step(
    "valid phone number with country code, parentheses and spaces",
    function () {
      assert(
        toPhoneNumber("+1 (234) 567 890") !== false,
        "Expected phone number to be valid",
      );
    },
  );

  // Test case for a valid phone number with country code, parentheses and dashes
  await t.step(
    "valid phone number with country code, parentheses and dashes",
    function () {
      assert(
        toPhoneNumber("+1 (234)-567-890") !== false,
        "Expected phone number to be valid",
      );
    },
  );

  // Test case for a valid phone number with german country code +49
  await t.step(
    "valid phone number with german country code +49",
    function () {
      assert(
        toPhoneNumber("+494721 56789") !== false,
        "Expected phone number to be valid",
      );
    },
  );

  // Test case for an invalid phone number (string)
  await t.step("invalid phone number - string", function () {
    assert(
      !toPhoneNumber("123") !== false,
      "Expected phone number to be invalid",
    );
  });

  // Test case for an invalid phone number (boolean)
  await t.step("invalid phone number - boolean", function () {
    assert(!toPhoneNumber(true), "Expected phone number to be invalid");
  });

  // Test case for an invalid phone number (null)
  await t.step("invalid phone number - null", function () {
    assert(!toPhoneNumber(null), "Expected phone number to be invalid");
  });

  // Test case for an invalid phone number (undefined)
  await t.step("invalid phone number - undefined", function () {
    assert(!toPhoneNumber(undefined), "Expected phone number to be invalid");
  });
});
