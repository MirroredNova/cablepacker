import { customAlphabet } from 'nanoid';

// Use a custom alphabet that avoids similar-looking characters
// Exclude: 0/O, 1/I/l, etc.
const nanoid = customAlphabet('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 8);

/**
 * Generates a short, unique, user-friendly ID for a generation result retrieval
 * Format: 8 uppercase alphanumeric characters (excluding confusing characters)
 * @returns A unique ID string
 */
export function generateResultId(): string {
  return nanoid();
}
