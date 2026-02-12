import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cookies } from 'next/headers';
import { encrypt } from '@/server/auth/session.auth';
import { createSession, deleteSession } from '@/server/auth/dal.auth';

vi.mock('next/headers', () => {
  const cookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };
  return {
    cookies: vi.fn(() => Promise.resolve(cookieStore)),
  };
});

vi.mock('@/server/auth/session.auth', () => ({
  decrypt: vi.fn(),
  encrypt: vi.fn(),
}));

describe('Authentication Data Access Layer', () => {
  let mockCookieStore: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCookieStore = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    };
    (cookies as any).mockResolvedValue(mockCookieStore);
  });

  describe('createSession', () => {
    it('sets session cookie with correct parameters', async () => {
      const username = 'testuser';
      const mockEncryptedSession = 'encrypted-data';
      (encrypt as any).mockResolvedValue(mockEncryptedSession);

      const realDateNow = Date.now;
      const mockNow = 1609459200000; // 2021-01-01T00:00:00.000Z
      global.Date.now = vi.fn(() => mockNow);

      const expectedExpires = new Date(mockNow + 24 * 60 * 60 * 1000);

      try {
        await createSession(username);

        expect(encrypt).toHaveBeenCalledWith({
          username: 'testuser',
          expiresAt: expectedExpires,
        });

        expect(cookies).toHaveBeenCalledTimes(1);
        expect(mockCookieStore.set).toHaveBeenCalledWith('session', mockEncryptedSession, {
          httpOnly: true,
          secure: true,
          expires: expectedExpires,
          sameSite: 'lax',
          path: '/',
        });
      } finally {
        global.Date.now = realDateNow;
      }
    });

    it('handles encryption errors', async () => {
      const username = 'testuser';
      const encryptError = new Error('Encryption failed');
      (encrypt as any).mockRejectedValue(encryptError);

      await expect(createSession(username)).rejects.toThrow('Encryption failed');
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });
  });

  describe('deleteSession', () => {
    it('deletes the session cookie', async () => {
      await deleteSession();

      expect(cookies).toHaveBeenCalledTimes(1);
      expect(mockCookieStore.delete).toHaveBeenCalledWith('session');
    });

    it('handles cookie deletion errors', async () => {
      const deleteError = new Error('Cookie deletion failed');
      mockCookieStore.delete.mockImplementation(() => {
        throw deleteError;
      });

      await expect(deleteSession()).rejects.toThrow('Cookie deletion failed');
    });
  });
});
