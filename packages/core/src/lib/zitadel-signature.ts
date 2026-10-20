import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verify the ZITADEL-Signature header of an Actions v2 target call:
 * `t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<body>">`, one v1 per key
 * during a rotation. A timestamp outside the tolerance is rejected.
 */
export function verifyZitadelSignature(
  header: string | undefined,
  body: Buffer,
  signingKey: string,
  toleranceSeconds = 300
): boolean {
  if (!header) return false;

  let timestamp: number | undefined;
  const signatures: Buffer[] = [];
  for (const part of header.split(',')) {
    const [key, value] = part.split('=');
    if (key === 't') timestamp = Number(value);
    else if (key === 'v1' && value) signatures.push(Buffer.from(value, 'hex'));
  }
  if (
    !timestamp ||
    Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds
  ) {
    return false;
  }

  const expected = createHmac('sha256', signingKey)
    .update(`${timestamp}.`)
    .update(body)
    .digest();
  return signatures.some(
    (sig) => sig.length === expected.length && timingSafeEqual(sig, expected)
  );
}
