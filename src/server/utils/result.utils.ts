import { customAlphabet } from 'nanoid';
import { BoreResult } from '@/types/algorithm.types';

// Use a custom alphabet that avoids similar-looking characters
// Exclude: 0/O, 1/I/l, etc.
const nanoid = customAlphabet('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 8);

export const extractResultMetadata = (boreResults: BoreResult) => {
  const cableCount = boreResults.cables.length;
  const boreDiameter = boreResults.bore.diameter;
  return { cableCount, boreDiameter };
};

/**
 * Generates a short, unique, user-friendly ID for result retrieval
 * Format: 8 uppercase alphanumeric characters (excluding confusing characters)
 */
export function generateResultId(): string {
  return nanoid();
}

/**
 * Validates if a string could be a valid result ID
 */
export function isValidResultId(id: string): boolean {
  // Must be exactly 8 characters long and only contain characters from our alphabet
  return /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/.test(id);
}
