import { assert } from "https://deno.land/std@0.212.0/assert/assert.ts";
import { isNumber } from "../../mod.ts";

Deno.test("isNumber", async (t) => {
  // Test case for a valid number
  await t.step("valid number", function () {
    assert(
      isNumber(123),
      "Expected number to be valid",
    );
  });

  // Test case for an invalid number (string)
  await t.step("invalid number - string", function () {
    assert(!isNumber("123"), "Expected number to be invalid");
  });

  // Test case for an invalid number (boolean)
  await t.step("invalid number - boolean", function () {
    assert(!isNumber(true), "Expected number to be invalid");
  });

  // Test case for an invalid number (null)
  await t.step("invalid number - null", function () {
    assert(!isNumber(null), "Expected number to be invalid");
  });

  // Test case for an invalid number (undefined)
  await t.step("invalid number - undefined", function () {
    assert(!isNumber(undefined), "Expected number to be invalid");
  });

  // Test case for an invalid number (NaN)
  await t.step("invalid number - NaN", function () {
    assert(!isNumber(NaN), "Expected number to be invalid");
  });
});
