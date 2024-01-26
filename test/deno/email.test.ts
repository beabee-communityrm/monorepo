import { assert } from "https://deno.land/std@0.212.0/assert/assert.ts";
import { isEmail } from "../../mod.ts";

Deno.test("email", async (t) => {
  await t.step("should be valid", function () {
    // Test with a valid email
    assert(isEmail("test@example.com"));
    // Test with a valid email containing a subdomain
    assert(isEmail("test@sub.example.com"));
    // Test with a valid email containing a number
    assert(isEmail("test123@example.com"));
    // Test with a valid email containing a hyphen
    assert(isEmail("test-test@example.com"));
    // Test with a valid email containing an underscore
    assert(isEmail("test_test@example.com"));
    // Test with a valid email containing a dot before the @
    assert(isEmail("test.test@example.com"));
  });

  await t.step("should be invalid", function () {
    // Test with an invalid email (missing @)
    assert(!isEmail("testexample.com"));
    // Test with an invalid email (missing domain)
    assert(!isEmail("test@"));
    // Test with an invalid email (missing username)
    assert(!isEmail("@example.com"));
    // Test with an invalid email (missing top-level domain)
    assert(!isEmail("test@example"));
    // Test with an invalid email (contains spaces)
    assert(!isEmail("test @example.com"));
    // Test with an invalid email (contains multiple @)
    assert(!isEmail("test@test@example.com"));
  });
});
