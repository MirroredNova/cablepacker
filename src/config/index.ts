import { DEFAULT_MAX_CIRCLES, DEFAULT_MAX_DIAMETER } from '@/constants';

// Server-side config (private env variables)
export const serverConfig = {
  maxCircles: Number(process.env.MAX_CIRCLES) || DEFAULT_MAX_CIRCLES,
  maxDiameter: Number(process.env.MAX_DIAMETER) || DEFAULT_MAX_DIAMETER,
  // Add other server-only config as needed
};

// Client-side config (public env variables)
export const clientConfig = {
  maxCircles: Number(process.env.NEXT_PUBLIC_MAX_CIRCLES) || DEFAULT_MAX_CIRCLES,
  maxDiameter: Number(process.env.NEXT_PUBLIC_MAX_DIAMETER) || DEFAULT_MAX_DIAMETER,
  // Add other client-accessible config as needed
};

// Helper functions that automatically select the right config based on context
export const getMaxCircles = () => (typeof window === 'undefined'
  ? serverConfig.maxCircles
  : clientConfig.maxCircles);

export const getMaxDiameter = () => (typeof window === 'undefined'
  ? serverConfig.maxDiameter
  : clientConfig.maxDiameter);
