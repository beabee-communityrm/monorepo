/**
 * Executes the `pwgen` command to generate a random password of a specified length.
 * @param length The length of the password to generate.
 * @returns A promise that resolves to the generated password.
 */
export const generatePassword = async (length: number): Promise<string> => {
  const command = new Deno.Command("pwgen", {
    args: [
      length.toString(),
    ],
  });
  const { code, stdout, stderr } = await command.output();
  if (code !== 0) {
    throw new Error(
      `Failed to generate password: ${new TextDecoder().decode(stderr)}`,
    );
  }
  return new TextDecoder().decode(stdout).trim();
};
