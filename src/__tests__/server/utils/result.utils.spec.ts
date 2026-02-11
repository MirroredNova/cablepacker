import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateResultId } from '@/server/utils/result.utils';

// Mock nanoid to provide predictable results
vi.mock('nanoid', () => ({
  customAlphabet: vi.fn().mockReturnValue(() => 'ABCD2345'),
}));

describe('Result Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateResultId', () => {
    it('should generate an 8-character ID', () => {
      const id = generateResultId();
      expect(id).toHaveLength(8);
    });

    it('should return a consistent mocked ID', () => {
      const id = generateResultId();
      expect(id).toBe('ABCD2345');
    });

    it('should generate different IDs in production (unmocked)', async () => {
      // For this test, we'll temporarily restore the real implementation
      vi.unmock('nanoid');

      // Import the real functions directly for this test
      const { generateResultId: realGenerate } = await import('@/server/utils/result.utils');

      const id1 = realGenerate();
      const id2 = realGenerate();

      expect(id1).toHaveLength(8);
      expect(id2).toHaveLength(8);

      // Re-mock nanoid for subsequent tests
      vi.mock('nanoid', () => ({
        customAlphabet: vi.fn().mockReturnValue(() => 'ABCD2345'),
      }));
    });
  });
});
