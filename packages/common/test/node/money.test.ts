import { assert } from "https://deno.land/std@0.212.0/assert/assert.ts";
import { isAmountOfMoney } from "../../mod.ts";

Deno.test("isAmountOfMoney", async (t) => {
  await t.step("valid amount of money - positive integer", function () {
    assert(
      isAmountOfMoney(100),
      "Expected 100 to be a valid amount of money",
    );
  });

  await t.step(
    "valid amount of money - positive float with two decimal places",
    function () {
      assert(
        isAmountOfMoney(100.50),
        "Expected 100.50 to be a valid amount of money",
      );
    },
  );

  await t.step("invalid amount of money - negative integer", function () {
    assert(
      !isAmountOfMoney(-100),
      "Expected -100 to be an invalid amount of money",
    );
  });

  await t.step(
    "invalid amount of money - positive float with more than two decimal places",
    function () {
      assert(
        !isAmountOfMoney(100.505),
        "Expected 100.505 to be an invalid amount of money",
      );
    },
  );

  await t.step("invalid amount of money - non-number value", function () {
    assert(
      !isAmountOfMoney("100"),
      "Expected '100' (string) to be an invalid amount of money",
    );
  });
});
