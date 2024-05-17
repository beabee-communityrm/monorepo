import { assert } from "https://deno.land/std@0.212.0/assert/assert.ts";
import { isValidPayFee } from "../../mod.ts";

Deno.test("isValidPayFee", async (t) => {
  await t.step("valid pay fee - monthly with fee", function () {
    assert(
      isValidPayFee(true, 1, "monthly"),
      "Expected 'true' to be a valid pay fee for £1 monthly",
    );
  });

  await t.step("valid pay fee - annually without fee", function () {
    assert(
      isValidPayFee(false, 1, "annually"),
      "Expected 'false' to be a valid pay fee for £1 annually",
    );
  });

  await t.step("invalid pay fee - annually with fee", function () {
    assert(
      !isValidPayFee(true, 1, "annually"),
      "Expected 'true' to be an invalid pay fee for £1 annually",
    );
  });

  await t.step("invalid pay fee - monthly without fee", function () {
    assert(
      !isValidPayFee(false, 1, "monthly"),
      "Expected 'false' to be an invalid pay fee for £1 monthly",
    );
  });

  await t.step("invalid pay fee - non-boolean value", function () {
    assert(
      !isValidPayFee("true", 1, "monthly"),
      "Expected 'true' (string) to be an invalid pay fee",
    );
  });

  await t.step("invalid pay fee - non-number amount", function () {
    assert(
      !isValidPayFee(true, "1", "monthly"),
      "Expected '1' (string) to be an invalid amount for pay fee",
    );
  });

  await t.step("invalid pay fee - invalid period", function () {
    assert(
      !isValidPayFee(true, 1, "daily"),
      "Expected 'daily' to be an invalid period for pay fee",
    );
  });
});
