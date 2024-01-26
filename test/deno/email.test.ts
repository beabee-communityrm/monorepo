import { assert } from "https://deno.land/std@0.212.0/assert/assert.ts";
import { isEmail } from "../../mod.ts";

Deno.test("email", async (t) => {
  await t.step("valid email", function () {
    assert(isEmail("test@example.com"));
  });

  await t.step("valid email with subdomain", function () {
    assert(isEmail("test@sub.example.com"));
  });

  await t.step("valid email with number", function () {
    assert(isEmail("test123@example.com"));
  });

  await t.step("valid email with hyphen", function () {
    assert(isEmail("test-test@example.com"));
  });

  await t.step("valid email with underscore", function () {
    assert(isEmail("test_test@example.com"));
  });

  await t.step("valid email with dot before @", function () {
    assert(isEmail("test.test@example.com"));
  });

  await t.step("invalid email missing @", function () {
    assert(!isEmail("testexample.com"));
  });

  await t.step("invalid email missing domain", function () {
    assert(!isEmail("test@"));
  });

  await t.step("invalid email missing username", function () {
    assert(!isEmail("@example.com"));
  });

  await t.step("invalid email missing top-level domain", function () {
    assert(!isEmail("test@example"));
  });

  await t.step("invalid email contains spaces", function () {
    assert(!isEmail("test @example.com"));
  });

  await t.step("invalid email contains multiple @", function () {
    assert(!isEmail("test@test@example.com"));
  });
});
