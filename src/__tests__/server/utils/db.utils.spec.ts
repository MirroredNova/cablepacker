import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Define but do not initialize these variables yet
let mockExportFunc: any;
let mockCreatePrivateKey: any;

// Use vi.importMock() for the config which is simpler
vi.mock('@/config', () => ({
  serverConfig: {
    SFDB_P8KEY: '"-----BEGIN PRIVATE KEY-----\\nMOCK_KEY_CONTENT\\n-----END PRIVATE KEY-----"',
    SFDB_ACCOUNT: 'test-account',
    SFDB_USERNAME: 'test-user',
    SFDB_ROLE: 'test-role',
    SFDB_WAREHOUSE: 'test-warehouse',
    SFDB_AUTHENTICATOR: 'test-authenticator',
    SFDB_DATABASE: 'test-database',
    SFDB_SCHEMA: 'test-schema',
    SFDB_MIN_POOL_SIZE: 5,
    SFDB_MAX_POOL_SIZE: 10,
    SFDB_ACQUIRETIMEOUTMILLIS: 60000,
    SFDB_EVICTIONRUNINTERVALMILLIS: 120000,
  },
}));

// Set up crypto mocks before importing your code
beforeEach(async () => {
  // Create fresh mocks for each test
  mockExportFunc = vi.fn().mockReturnValue({
    toString: () => 'MOCK_EXPORTED_KEY',
  });

  mockCreatePrivateKey = vi.fn().mockReturnValue({
    export: mockExportFunc,
  });

  // Use doMock instead of mock to avoid hoisting
  vi.doMock('crypto', () => ({
    default: {
      createPrivateKey: mockCreatePrivateKey,
    },
    createPrivateKey: mockCreatePrivateKey,
  }));

  // Reset modules to ensure fresh imports
  vi.resetModules();
});

// Clean up after tests
afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('Database Utilities', () => {
  // Import the modules in each test to get the freshly mocked versions
  let createPrivateKey: any;
  let getPoolConfig: any;

  beforeEach(async () => {
    // Import after mocks are set up
    const utils = await import('@/server/utils/db.utils');
    createPrivateKey = utils.createPrivateKey;
    getPoolConfig = utils.getPoolConfig;
  });

  describe('createPrivateKey', () => {
    it('should clean and process a private key string', () => {
      const keyString = '"-----BEGIN PRIVATE KEY-----\\nKEY_CONTENT\\n-----END PRIVATE KEY-----"';
      const expectedCleanKey = '-----BEGIN PRIVATE KEY-----\nKEY_CONTENT\n-----END PRIVATE KEY-----';

      const result = createPrivateKey(keyString);

      // Check that crypto.createPrivateKey was called with cleaned key
      expect(mockCreatePrivateKey).toHaveBeenCalledWith({
        key: expectedCleanKey,
        format: 'pem',
      });

      // Check the export method was called with correct params
      expect(mockExportFunc).toHaveBeenCalledWith({
        format: 'pem',
        type: 'pkcs8',
      });

      // Check the return value
      expect(result).toBe('MOCK_EXPORTED_KEY');
    });

    it('should handle a key string without quotes', () => {
      const keyString = '-----BEGIN PRIVATE KEY-----\\nKEY_CONTENT\\n-----END PRIVATE KEY-----';
      const expectedCleanKey = '-----BEGIN PRIVATE KEY-----\nKEY_CONTENT\n-----END PRIVATE KEY-----';

      createPrivateKey(keyString);

      expect(mockCreatePrivateKey).toHaveBeenCalledWith({
        key: expectedCleanKey,
        format: 'pem',
      });
    });

    it('should throw and log an error when key processing fails', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Make createPrivateKey throw an error
      mockCreatePrivateKey.mockImplementationOnce(() => {
        throw new Error('Invalid key format');
      });

      const keyString = 'INVALID_KEY';

      expect(() => createPrivateKey(keyString)).toThrow('Invalid key format');
      expect(errorSpy).toHaveBeenCalledWith('Error processing private key:', expect.any(Error));
    });
  });

  describe('getPoolConfig', () => {
    it('should return connection and pool options with the correct structure', () => {
      const result = getPoolConfig();

      // Check that createPrivateKey was called
      expect(mockCreatePrivateKey).toHaveBeenCalled();

      // Check the structure of the returned object
      expect(result).toHaveProperty('connOptions');
      expect(result).toHaveProperty('poolOptions');

      // Check connection options
      expect(result.connOptions).toEqual({
        account: 'test-account',
        username: 'test-user',
        role: 'test-role',
        warehouse: 'test-warehouse',
        authenticator: 'test-authenticator',
        database: 'test-database',
        schema: 'test-schema',
        privateKey: 'MOCK_EXPORTED_KEY',
      });

      // Check pool options
      expect(result.poolOptions).toEqual({
        min: 5,
        max: 10,
        acquireTimeoutMillis: 60000,
        evictionRunIntervalMillis: 120000,
        testOnBorrow: true,
      });
    });

    it('should propagate errors from createPrivateKey', () => {
      // Setup createPrivateKey to throw an error
      mockCreatePrivateKey.mockImplementationOnce(() => {
        throw new Error('Key processing error');
      });

      expect(() => getPoolConfig()).toThrow('Key processing error');
    });
  });
});
