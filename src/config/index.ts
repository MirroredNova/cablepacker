import {
  DEFAULT_ANGLE_STEP_SIZE,
  DEFAULT_MAX_CIRCLES,
  DEFAULT_MAX_DIAMETER,
  DEFAULT_MAX_ITERATIONS,
  DEFAULT_MIN_ENCLOSE_STEP_SIZE,
  DEFAULT_RADIUS_STEP_SIZE,
} from '@/constants';

// Server-side config (private env variables)
export const serverConfig = {
  MAX_ITERATIONS: Number(process.env.MAX_ITERATIONS) || DEFAULT_MAX_ITERATIONS,
  RADIUS_STEP_SIZE: Number(process.env.RADIUS_STEP_SIZE) || DEFAULT_RADIUS_STEP_SIZE,
  ANGLE_STEP_SIZE: Number(process.env.ANGLE_STEP_SIZE) || DEFAULT_ANGLE_STEP_SIZE,
  MIN_ENCLOSE_STEP_SIZE: Number(process.env.MIN_ENCLOSE_STEP_SIZE) || DEFAULT_MIN_ENCLOSE_STEP_SIZE,

  maxCircles: Number(process.env.MAX_CIRCLES) || DEFAULT_MAX_CIRCLES,
  maxDiameter: Number(process.env.MAX_DIAMETER) || DEFAULT_MAX_DIAMETER,

  SFDB_P8KEY: process.env.SFDB_P8KEY || '',
  SFDB_ACCOUNT: process.env.SFDB_ACCOUNT || '',
  SFDB_USERNAME: process.env.SFDB_USERNAME || '',
  SFDB_ROLE: process.env.SFDB_ROLE || '',
  SFDB_WAREHOUSE: process.env.SFDB_WAREHOUSE || '',
  SFDB_DATABASE: process.env.SFDB_DATABASE || '',
  SFDB_SCHEMA: process.env.SFDB_SCHEMA || '',
  SFDB_AUTHENTICATOR: process.env.SFDB_AUTHENTICATOR || '',
  SFDB_MIN_POOL_SIZE: Number(process.env.SFDB_MIN_POOL_SIZE) || 0,
  SFDB_MAX_POOL_SIZE: Number(process.env.SFDB_MAX_POOL_SIZE) || 0,
  SFDB_ACQUIRETIMEOUTMILLIS: Number(process.env.SFDB_ACQUIRETIMEOUTMILLIS) || 0,
  SFDB_EVICTIONRUNINTERVALMILLIS: Number(process.env.SFDB_EVICTIONRUNINTERVALMILLIS) || 0,
};

// Client-side config (public env variables)
export const clientConfig = {
  maxCircles: Number(process.env.NEXT_PUBLIC_MAX_CIRCLES) || DEFAULT_MAX_CIRCLES,
  maxDiameter: Number(process.env.NEXT_PUBLIC_MAX_DIAMETER) || DEFAULT_MAX_DIAMETER,
};

export const getMaxCircles = () => (typeof window === 'undefined'
  ? serverConfig.maxCircles
  : clientConfig.maxCircles);

export const getMaxDiameter = () => (typeof window === 'undefined'
  ? serverConfig.maxDiameter
  : clientConfig.maxDiameter);
