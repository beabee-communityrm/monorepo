import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { verifyZitadelSignature } from './zitadel-signature';

const key = 'signing-key';
const body = Buffer.from('{"user":{"id":"u1"}}');

function sign(timestamp: number, signingKey = key): string {
  const mac = createHmac('sha256', signingKey)
    .update(`${timestamp}.`)
    .update(body)
    .digest('hex');
  return `t=${timestamp},v1=${mac}`;
}

const now = Math.floor(Date.now() / 1000);

describe('verifyZitadelSignature', () => {
  it('accepts a fresh signature with the right key', () => {
    expect(verifyZitadelSignature(sign(now), body, key)).toBe(true);
  });

  it('accepts any of several signatures during a key rotation', () => {
    const header = sign(now, 'old-key') + ',' + sign(now).split(',')[1];
    expect(verifyZitadelSignature(header, body, key)).toBe(true);
  });

  it('rejects a wrong key', () => {
    expect(verifyZitadelSignature(sign(now, 'other'), body, key)).toBe(false);
  });

  it('rejects a changed body', () => {
    expect(verifyZitadelSignature(sign(now), Buffer.from('{}'), key)).toBe(
      false
    );
  });

  it('rejects an old timestamp', () => {
    expect(verifyZitadelSignature(sign(now - 600), body, key)).toBe(false);
  });

  it('rejects a missing or malformed header', () => {
    expect(verifyZitadelSignature(undefined, body, key)).toBe(false);
    expect(verifyZitadelSignature('garbage', body, key)).toBe(false);
  });
});
