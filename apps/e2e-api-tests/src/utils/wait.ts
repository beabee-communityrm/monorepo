/**
 * Poll until a check passes, for effects that arrive asynchronously, e.g.
 * through a webhook
 * @param description What is being waited for, used in the timeout error
 * @param check Returns a truthy value once the effect has happened
 * @param timeout How long to wait in milliseconds
 * @returns The value the check returned
 */
export async function waitFor<T>(
  description: string,
  check: () => Promise<T>,
  timeout = 90000
): Promise<NonNullable<T>> {
  const deadline = Date.now() + timeout;
  for (;;) {
    const result = await check();
    if (result) {
      return result;
    }
    if (Date.now() > deadline) {
      throw new Error(`Timed out waiting for ${description}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
