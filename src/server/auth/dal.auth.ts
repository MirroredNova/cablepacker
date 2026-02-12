import 'server-only';

import { cookies } from 'next/headers';
import { encrypt } from '@/server/auth/session.auth';

export async function createSession(username: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  const session = await encrypt({ username, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
