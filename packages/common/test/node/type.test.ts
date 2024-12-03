import { assert } from "https://deno.land/std@0.212.0/assert/assert.ts";
import { isType } from "../../mod.ts";

Deno.test("isType", async (t) => {
  await t.step("valid type - string", function () {
    assert(
      isType(["string"], "string"),
      "Expected 'string' to be a valid type",
    );
  });

  await t.step("valid type - number", function () {
    assert(isType(["number"], 1), "Expected 'number' to be a valid type");
  });

  await t.step("valid type - object", function () {
    assert(
      isType(["object"], { foo: "bar" }),
      "Expected 'object' to be an valid type",
    );
  });

  await t.step("invalid type - date", function () {
    assert(
      !isType(["string", "number"], new Date()),
      "Expected 'date' to be a invalid type",
    );
  });

  await t.step("invalid type - null", function () {
    assert(
      !isType(["string", "number"], null),
      "Expected null to be an invalid type",
    );
  });

  await t.step("invalid type - undefined", function () {
    assert(
      !isType(["string", "number"], undefined),
      "Expected undefined to be an invalid type",
    );
  });

  await t.step("invalid type - array", function () {
    assert(
      !isType(["string", "number"], ["a", "b"]),
      "Expected 'array' to be a invalid type",
    );
  });
});
