import { assert } from "https://deno.land/std@0.212.0/assert/assert.ts";
import { isAngle } from "../../mod.ts";

Deno.test("isAngle", async (t) => {
  await t.step("valid angle - 0", function () {
    assert(isAngle(0), "Expected '0' to be a valid angle");
  });

  await t.step("valid angle - 180", function () {
    assert(isAngle(180), "Expected '180' to be a valid angle");
  });

  await t.step("valid angle - -180", function () {
    assert(isAngle(-180), "Expected '-180' to be a valid angle");
  });

  await t.step("invalid angle - 181", function () {
    assert(!isAngle(181), "Expected '181' to be an invalid angle");
  });

  await t.step("invalid angle - -181", function () {
    assert(!isAngle(-181), "Expected '-181' to be an invalid angle");
  });

  await t.step("invalid angle - not a number", function () {
    assert(
      !isAngle("not a number"),
      "Expected 'not a number' to be an invalid angle",
    );
  });
});
