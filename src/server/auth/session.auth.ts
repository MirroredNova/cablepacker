import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { SessionPayload } from '@/types/auth.types';

function getEncodedSessionKey() {
  const secretKey = process.env.SESSION_SECRET;

  if (!secretKey || secretKey.length < 32) {
    throw new Error('SESSION_SECRET must be defined and at least 32 characters long');
  }

  return new TextEncoder().encode(secretKey);
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getEncodedSessionKey());
}

export async function decrypt(session: string | undefined = '') {
  if (!session) {
    return null;
  }

  try {
    const { payload } = await jwtVerify<SessionPayload>(session, getEncodedSessionKey(), {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    return null;
  }
}
