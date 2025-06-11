import { expect, test } from 'vitest';

test('global fetch method is available and working', async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');

  // Check if fetch method is working
  expect(response.status).toBe(200);
});
