import { cookies } from 'next/headers';
import { decrypt } from '@/server/auth/session.auth';

/**
 * Wraps a server action to ensure the user is authenticated
 * @param action The server action to protect
 * @returns A wrapped server action that checks auth before execution
 */
export function adminProtectedAction<T extends any[], R>(
  action: (...args: T) => Promise<R>,
): (...args: T) => Promise<R> {
  return async (...args: T) => {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie);
    const isAuthenticated = !!session?.username;

    if (!isAuthenticated) {
      throw new Error('Unauthorized: Authentication required');
    }

    return action(...args);
  };
}
