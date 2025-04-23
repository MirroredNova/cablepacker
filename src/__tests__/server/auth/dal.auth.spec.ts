import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt, encrypt } from '@/server/auth/session.auth';

// Now import the module that uses these dependencies
import { verifySession, createSession, deleteSession } from '@/server/auth/dal.auth';

// Create a redirect error class that simulates Next.js behavior
class RedirectError extends Error {
  url: string;

  constructor(url: string) {
    super(`NEXT_REDIRECT: ${url}`);
    this.url = url;
    this.name = 'RedirectError';
  }
}

// Then mock dependencies - with improved behavior
vi.mock('next/navigation', () => ({
  // Make redirect throw an error like the real Next.js implementation
  redirect: vi.fn((url: string) => {
    throw new RedirectError(url);
  }),
}));

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

vi.mock('react', () => ({
  cache: vi.fn((fn) => fn),
}));

vi.mock('@/server/auth/session.auth', () => ({
  decrypt: vi.fn(),
  encrypt: vi.fn(),
}));

describe('Authentication Data Access Layer', () => {
  // Mock cookie store for easier access in tests
  let mockCookieStore: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup cookie store mock
    mockCookieStore = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    };
    (cookies as any).mockResolvedValue(mockCookieStore);
  });

  describe('verifySession', () => {
    it('returns auth info when valid session exists', async () => {
      // Arrange
      const mockCookie = 'encrypted-session-cookie';
      const mockSession = { userId: 'user-123' };

      mockCookieStore.get.mockReturnValue({ value: mockCookie });
      (decrypt as any).mockResolvedValue(mockSession);

      // Act
      const result = await verifySession();

      // Assert
      expect(result).toEqual({
        isAuth: true,
        userId: 'user-123',
      });
      expect(mockCookieStore.get).toHaveBeenCalledWith('session');
      expect(decrypt).toHaveBeenCalledWith(mockCookie);
      expect(redirect).not.toHaveBeenCalled();
    });

    it('redirects to login when no cookie exists', async () => {
      // Arrange
      mockCookieStore.get.mockReturnValue(undefined);
      (decrypt as any).mockResolvedValue(null);

      // Act & Assert
      await expect(verifySession()).rejects.toThrow('NEXT_REDIRECT: /login');
      expect(mockCookieStore.get).toHaveBeenCalledWith('session');
      expect(decrypt).toHaveBeenCalledWith(undefined);
      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('redirects to login when session is invalid', async () => {
      // Arrange
      const mockCookie = 'encrypted-session-cookie';
      mockCookieStore.get.mockReturnValue({ value: mockCookie });
      (decrypt as any).mockResolvedValue({ username: 'user1' }); // Missing userId

      // Act & Assert
      await expect(verifySession()).rejects.toThrow('NEXT_REDIRECT: /login');
      expect(mockCookieStore.get).toHaveBeenCalledWith('session');
      expect(decrypt).toHaveBeenCalledWith(mockCookie);
      expect(redirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('createSession', () => {
    it('sets session cookie with correct parameters', async () => {
      // Arrange
      const username = 'testuser';
      const mockEncryptedSession = 'encrypted-data';
      (encrypt as any).mockResolvedValue(mockEncryptedSession);

      // Mock Date.now for consistent testing
      const realDateNow = Date.now;
      const mockNow = 1609459200000; // 2021-01-01T00:00:00.000Z
      global.Date.now = vi.fn(() => mockNow);

      // Calculate expected expiration
      const expectedExpires = new Date(mockNow + 7 * 24 * 60 * 60 * 1000);

      try {
        // Act
        await createSession(username);

        // Assert
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
        // Restore Date.now
        global.Date.now = realDateNow;
      }
    });

    it('handles encryption errors', async () => {
      // Arrange
      const username = 'testuser';
      const encryptError = new Error('Encryption failed');
      (encrypt as any).mockRejectedValue(encryptError);

      // Act & Assert
      await expect(createSession(username)).rejects.toThrow('Encryption failed');
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });
  });

  describe('deleteSession', () => {
    it('deletes the session cookie', async () => {
      // Act
      await deleteSession();

      // Assert
      expect(cookies).toHaveBeenCalledTimes(1);
      expect(mockCookieStore.delete).toHaveBeenCalledWith('session');
    });

    it('handles cookie deletion errors', async () => {
      // Arrange
      const deleteError = new Error('Cookie deletion failed');
      mockCookieStore.delete.mockImplementation(() => {
        throw deleteError;
      });

      // Act & Assert
      await expect(deleteSession()).rejects.toThrow('Cookie deletion failed');
    });
  });

  describe('Integration between functions', () => {
    it('creates a session that can be verified', async () => {
      // Arrange
      const username = 'testuser';
      const userId = 'user-123';
      const mockEncryptedSession = 'encrypted-data';

      // Setup for createSession
      (encrypt as any).mockResolvedValue(mockEncryptedSession);

      // Setup for verifySession
      mockCookieStore.get.mockReturnValue({ value: mockEncryptedSession });
      (decrypt as any).mockResolvedValue({ userId, username });

      // Act - Create session
      await createSession(username);

      // Assert session was created
      expect(mockCookieStore.set).toHaveBeenCalledWith('session', mockEncryptedSession, expect.any(Object));

      // Act - Verify the session
      const sessionInfo = await verifySession();

      // Assert session was verified
      expect(sessionInfo).toEqual({
        isAuth: true,
        userId,
      });
    });

    it('deleteSession makes verifySession redirect', async () => {
      // Arrange - setup session first
      const mockEncryptedSession = 'encrypted-data';
      mockCookieStore.get.mockReturnValue({ value: mockEncryptedSession });
      (decrypt as any).mockResolvedValue({ userId: 'user-123' });

      // Act - Delete session
      await deleteSession();

      // Setup cookie store to return undefined after deletion
      mockCookieStore.get.mockReturnValue(undefined);
      (decrypt as any).mockResolvedValue(null);

      // Act & Assert - verify should now redirect
      await expect(verifySession()).rejects.toThrow('NEXT_REDIRECT: /login');
      expect(redirect).toHaveBeenCalledWith('/login');
    });
  });
});
