import { once } from 'node:events';
import { createWriteStream } from 'node:fs';

/**
 * Run a function with stdout redirected to a file.
 * If no filePath is given, stdout is left untouched.
 *
 * This should be called INSIDE the runApp callback so that
 * TypeORM startup queries stay in the terminal.
 */
export async function withFileOutput(
  filePath: string | undefined,
  fn: () => Promise<void>
): Promise<void> {
  if (!filePath) {
    await fn();
    return;
  }

  const stream = createWriteStream(filePath);
  const originalWrite = process.stdout.write;

  process.stdout.write = function (
    chunk: unknown,
    ...args: unknown[]
  ): boolean {
    return (stream.write as Function).call(stream, chunk, ...args);
  } as typeof process.stdout.write;

  try {
    await fn();
  } finally {
    process.stdout.write = originalWrite;
    stream.end();
    await once(stream, 'finish');
  }
}
