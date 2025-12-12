import {
  DEFAULT_MAX_CIRCLES,
  DEFAULT_MAX_DIAMETER,
  DEFAULT_ANGLE_STEP_SIZE,
  DEFAULT_MAX_ITERATIONS,
  DEFAULT_MIN_ENCLOSE_STEP_SIZE,
  DEFAULT_RADIUS_STEP_SIZE,
} from '@/constants';

// Server-side config (private env variables)
if (typeof window === 'undefined') {
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be defined');
  }
}

export const serverConfig = {
  MAX_ITERATIONS: Number(process.env.MAX_ITERATIONS) || DEFAULT_MAX_ITERATIONS,
  RADIUS_STEP_SIZE: Number(process.env.RADIUS_STEP_SIZE) || DEFAULT_RADIUS_STEP_SIZE,
  ANGLE_STEP_SIZE: Number(process.env.ANGLE_STEP_SIZE) || DEFAULT_ANGLE_STEP_SIZE,
  MIN_ENCLOSE_STEP_SIZE: Number(process.env.MIN_ENCLOSE_STEP_SIZE) || DEFAULT_MIN_ENCLOSE_STEP_SIZE,

  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

  MAX_CIRCLES: Number(process.env.MAX_CIRCLES) || DEFAULT_MAX_CIRCLES,
  MAX_DIAMETER: Number(process.env.MAX_DIAMETER) || DEFAULT_MAX_DIAMETER,

  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '',
};

// Client-side config (public env variables)
export const clientConfig = {
  MAX_CIRCLES: Number(process.env.NEXT_PUBLIC_MAX_CIRCLES) || DEFAULT_MAX_CIRCLES,
  MAX_DIAMETER: Number(process.env.NEXT_PUBLIC_MAX_DIAMETER) || DEFAULT_MAX_DIAMETER,
};
