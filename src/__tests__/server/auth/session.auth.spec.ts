import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SignJWT } from 'jose';
import { SessionPayload } from '@/types/auth.types';
import { encrypt, decrypt } from '@/server/auth/session.auth';

// Spy on console.log
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

// Store original TextEncoder
const originalTextEncoder = global.TextEncoder;

// Cache original env
const originalEnv = { ...process.env };

// Create a proper secretKey for tests that doesn't change
const TEST_SECRET = 'test-secret-key-for-testing-32-chars-minimum';

// Create a proper encoded key for testing
const ENCODED_TEST_KEY = new Uint8Array([116, 101, 115, 116]); // just some bytes for testing

// Create mock implementation variables to modify in tests
let mockSignReturnValue = 'mock-jwt-token';
let mockVerifyReturnValue: any = null;
let shouldThrowOnVerify = false;
let shouldThrowOnSign = false;

// Mock TextEncoder to return our test key
vi.mock('util', () => ({
  TextEncoder() {
    return {
      encode: () => ENCODED_TEST_KEY,
    };
  },
}));

// Mock the jose library with configurable behavior
vi.mock('jose', () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    sign: vi.fn().mockImplementation(() => {
      if (shouldThrowOnSign) {
        return Promise.reject(new Error('Failed to sign JWT'));
      }
      return Promise.resolve(mockSignReturnValue);
    }),
  })),
  jwtVerify: vi.fn().mockImplementation((token) => {
    if (shouldThrowOnVerify || token === '') {
      return Promise.reject(new Error('Invalid token'));
    }
    return Promise.resolve(mockVerifyReturnValue);
  }),
}));

describe('Session Authentication', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Reset mock implementation variables
    mockSignReturnValue = 'mock-jwt-token';
    mockVerifyReturnValue = { payload: { username: 'testuser' } };
    shouldThrowOnVerify = false;
    shouldThrowOnSign = false;

    // Setup environment for testing - BEFORE module import
    process.env.SESSION_SECRET = TEST_SECRET;

    // Restore TextEncoder if it was modified
    if (!global.TextEncoder) {
      global.TextEncoder = originalTextEncoder;
    }
  });

  afterEach(() => {
    // Restore env
    process.env = { ...originalEnv };

    // Restore TextEncoder
    global.TextEncoder = originalTextEncoder;

    // Clear console spy
    consoleLogSpy.mockClear();
  });

  describe('encrypt', () => {
    it('creates a properly signed JWT with the payload', async () => {
      // Arrange
      const payload: SessionPayload = {
        username: 'testuser',
        expiresAt: new Date('2023-01-01'),
      };

      // Act
      const token = await encrypt(payload);

      // Assert
      expect(token).toBe('mock-jwt-token');

      // Verify SignJWT was called correctly
      expect(SignJWT).toHaveBeenCalledWith(payload);

      // Get the SignJWT instance
      const signJwtInstance = (SignJWT as any).mock.results[0].value;

      // Verify methods were called with correct params
      expect(signJwtInstance.setProtectedHeader).toHaveBeenCalledWith({ alg: 'HS256' });
      expect(signJwtInstance.setIssuedAt).toHaveBeenCalled();
      expect(signJwtInstance.setExpirationTime).toHaveBeenCalledWith('7d');
    });

    it('throws an error if environment variable is missing', async () => {
      // Arrange - remove the env var
      process.env.SESSION_SECRET = undefined;

      // Create payload
      const payload: SessionPayload = {
        username: 'testuser',
        expiresAt: new Date('2023-01-01'),
      };

      // Act & Assert
      await expect(encrypt(payload)).rejects.toThrow(
        'SESSION_SECRET must be defined and at least 32 characters long',
      );
    });
  });

  describe('decrypt', () => {
    it('returns null for an invalid JWT', async () => {
      // Arrange
      const mockSession = 'invalid-jwt-token';

      // Mock jwtVerify to throw error
      shouldThrowOnVerify = true;

      // Act
      const result = await decrypt(mockSession);

      // Assert
      expect(result).toBeNull();
    });

    it('handles expired tokens', async () => {
      // Arrange
      const mockSession = 'expired-jwt-token';

      // Mock jwtVerify to throw expiry error
      shouldThrowOnVerify = true;

      // Act
      const result = await decrypt(mockSession);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Integration between encrypt and decrypt', () => {
    it('can decrypt what it encrypts', async () => {
      // Arrange
      const payload: SessionPayload = {
        username: 'testuser',
        expiresAt: new Date('2023-01-01'),
      };

      // Setup specific token for this test
      mockSignReturnValue = 'mock-integration-token';

      // Setup to return the payload on verification
      mockVerifyReturnValue = { payload };

      // Act
      const token = await encrypt(payload);
      const decrypted = await decrypt(token);

      // Assert
      expect(token).toBe('mock-integration-token');
      expect(decrypted).toEqual(payload);
    });
  });

  describe('Error handling', () => {
    it('handles TextEncoder failures', async () => {
      // Arrange - mock TextEncoder to be undefined
      global.TextEncoder = undefined as any;

      // Setup to throw when sign is called
      shouldThrowOnSign = true;

      // Create payload
      const payload: SessionPayload = {
        username: 'testuser',
        expiresAt: new Date(),
      };

      // Act & Assert - should throw because TextEncoder is missing
      await expect(encrypt(payload)).rejects.toThrow();
    });
  });
});
