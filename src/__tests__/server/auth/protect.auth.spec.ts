import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cookies } from 'next/headers';
import { decrypt } from '@/server/auth/session.auth';

// Import the function to test
import { adminProtectedAction } from '@/server/auth/protect.auth';

// Mock dependencies
vi.mock('next/headers', () => {
  const cookieStore = {
    get: vi.fn(),
  };
  return {
    cookies: vi.fn(() => Promise.resolve(cookieStore)),
  };
});

vi.mock('@/server/auth/session.auth', () => ({
  decrypt: vi.fn(),
}));

describe('Authentication Protection', () => {
  // Mock cookie store for easier access in tests
  let mockCookieStore: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup cookie store mock
    mockCookieStore = {
      get: vi.fn(),
    };
    (cookies as any).mockResolvedValue(mockCookieStore);
  });

  describe('adminProtectedAction', () => {
    // Mock action to wrap
    const mockAction = vi.fn(async (arg1: string, arg2: number) => `${arg1}-${arg2}`);

    it('allows authenticated users to call the action', async () => {
      // Arrange
      const mockCookie = 'encrypted-session-cookie';
      const mockSession = { username: 'admin' };

      mockCookieStore.get.mockReturnValue({ value: mockCookie });
      (decrypt as any).mockResolvedValue(mockSession);

      // Create protected version of the action
      const protectedAction = adminProtectedAction(mockAction);

      // Act
      const result = await protectedAction('test', 123);

      // Assert
      expect(result).toBe('test-123');
      expect(mockCookieStore.get).toHaveBeenCalledWith('session');
      expect(decrypt).toHaveBeenCalledWith(mockCookie);
      expect(mockAction).toHaveBeenCalledWith('test', 123);
    });

    it('blocks access when cookie is missing', async () => {
      // Arrange
      mockCookieStore.get.mockReturnValue(undefined);
      (decrypt as any).mockResolvedValue(null);

      // Create protected version of the action
      const protectedAction = adminProtectedAction(mockAction);

      // Act & Assert
      await expect(protectedAction('test', 123)).rejects.toThrow('Unauthorized: Authentication required');
      expect(mockCookieStore.get).toHaveBeenCalledWith('session');
      expect(decrypt).toHaveBeenCalledWith(undefined);
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('blocks access when session is invalid', async () => {
      // Arrange
      const mockCookie = 'encrypted-session-cookie';
      mockCookieStore.get.mockReturnValue({ value: mockCookie });
      (decrypt as any).mockResolvedValue({ userId: '123' }); // Missing username

      // Create protected version of the action
      const protectedAction = adminProtectedAction(mockAction);

      // Act & Assert
      await expect(protectedAction('test', 123)).rejects.toThrow('Unauthorized: Authentication required');
      expect(mockCookieStore.get).toHaveBeenCalledWith('session');
      expect(decrypt).toHaveBeenCalledWith(mockCookie);
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('blocks access when session is empty', async () => {
      // Arrange
      const mockCookie = 'encrypted-session-cookie';
      mockCookieStore.get.mockReturnValue({ value: mockCookie });
      (decrypt as any).mockResolvedValue({}); // Empty session

      // Create protected version of the action
      const protectedAction = adminProtectedAction(mockAction);

      // Act & Assert
      await expect(protectedAction('test', 123)).rejects.toThrow('Unauthorized: Authentication required');
    });

    it('passes along error from the wrapped action', async () => {
      // Arrange
      const mockCookie = 'encrypted-session-cookie';
      const mockSession = { username: 'admin' };

      mockCookieStore.get.mockReturnValue({ value: mockCookie });
      (decrypt as any).mockResolvedValue(mockSession);

      // Create an action that throws an error
      const errorAction = vi.fn().mockRejectedValue(new Error('Action error'));
      const protectedErrorAction = adminProtectedAction(errorAction);

      // Act & Assert
      await expect(protectedErrorAction('test', 123)).rejects.toThrow('Action error');
      expect(errorAction).toHaveBeenCalledWith('test', 123);
    });

    it('handles decrypt errors', async () => {
      // Arrange
      const mockCookie = 'encrypted-session-cookie';
      mockCookieStore.get.mockReturnValue({ value: mockCookie });
      (decrypt as any).mockRejectedValue(new Error('Decryption failed'));

      // Create protected version of the action
      const protectedAction = adminProtectedAction(mockAction);

      // Act & Assert
      await expect(protectedAction('test', 123)).rejects.toThrow('Decryption failed');
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('works with zero arguments', async () => {
      // Arrange
      const mockCookie = 'encrypted-session-cookie';
      const mockSession = { username: 'admin' };

      mockCookieStore.get.mockReturnValue({ value: mockCookie });
      (decrypt as any).mockResolvedValue(mockSession);

      // Create an action with no arguments
      const noArgsAction = vi.fn().mockResolvedValue('result');
      const protectedNoArgsAction = adminProtectedAction(noArgsAction);

      // Act
      const result = await protectedNoArgsAction();

      // Assert
      expect(result).toBe('result');
      expect(noArgsAction).toHaveBeenCalledWith();
    });

    it('works with complex return types', async () => {
      // Arrange
      const mockCookie = 'encrypted-session-cookie';
      const mockSession = { username: 'admin' };

      mockCookieStore.get.mockReturnValue({ value: mockCookie });
      (decrypt as any).mockResolvedValue(mockSession);

      // Complex return type
      const complexResult = {
        data: [1, 2, 3],
        metadata: { total: 3 },
        success: true,
      };

      // Create an action with complex return
      const complexAction = vi.fn().mockResolvedValue(complexResult);
      const protectedComplexAction = adminProtectedAction(complexAction);

      // Act
      const result = await protectedComplexAction('test');

      // Assert
      expect(result).toEqual(complexResult);
      expect(complexAction).toHaveBeenCalledWith('test');
    });

    it('preserves the type signature of the wrapped function', async () => {
      // This test verifies TypeScript types (compile-time check)
      // We're testing that the HOC returns a function with the same signature

      // Define a typed function
      async function typedAction(id: number, name: string): Promise<{ id: number, name: string }> {
        return { id, name };
      }

      // Wrap it with adminProtectedAction
      const protectedTypedAction = adminProtectedAction(typedAction);

      // Set up for authentication to pass
      const mockCookie = 'encrypted-session-cookie';
      const mockSession = { username: 'admin' };

      mockCookieStore.get.mockReturnValue({ value: mockCookie });
      (decrypt as any).mockResolvedValue(mockSession);

      // Call it with the correct types
      const result = await protectedTypedAction(1, 'test');

      // Verify result has the expected shape
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
    });
  });
});
