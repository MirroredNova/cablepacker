import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  compiler: {
    removeConsole: false,
  },
  experimental: {
    serverMinification: false,
  },
  poweredByHeader: false,
};

export default nextConfig;
