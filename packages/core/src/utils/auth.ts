import crypto from 'node:crypto';

export function generateApiKey(
  idLength: number = 16,
  secretLength: number = 48
): {
  id: string;
  secret: string;
  secretHash: string;
  token: string;
} {
  const id = crypto.randomBytes(idLength / 2).toString('hex');
  const secret = crypto.randomBytes(secretLength / 2).toString('hex');
  const secretHash = crypto.createHash('sha256').update(secret).digest('hex');
  const token = `${id}_${secret}`;
  return { id, secret, secretHash, token };
}

export function extractToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1] || null;
  }
  return null;
}
