import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: 'build',
  compiler: {
    removeConsole: false,
  },
  experimental: {
    serverMinification: false,
  },
  poweredByHeader: false,
};

export default nextConfig;
