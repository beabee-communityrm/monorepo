import { assert, assertEquals } from "std/assert/mod.ts";

Deno.test("global fetch method is available and working", async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");

  const data = await response.json();

  // Check if fetch method is working
  assertEquals(response.status, 200);

  // Check if data exists
  assert(data);
});
