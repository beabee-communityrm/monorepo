import { assert } from "https://deno.land/std@0.212.0/assert/assert.ts";
import { isPeriod } from "../../mod.ts";

Deno.test("isPeriod", async (t) => {
  await t.step("valid period - monthly", function () {
    assert(isPeriod("monthly"), "Expected 'monthly' to be a valid period");
  });

  await t.step("valid period - annually", function () {
    assert(isPeriod("annually"), "Expected 'annually' to be a valid period");
  });

  await t.step("invalid period - daily", function () {
    assert(!isPeriod("daily"), "Expected 'daily' to be an invalid period");
  });

  await t.step("invalid period - empty string", function () {
    assert(!isPeriod(""), "Expected empty string to be an invalid period");
  });

  await t.step("invalid period - null", function () {
    assert(!isPeriod(null), "Expected null to be an invalid period");
  });
});
