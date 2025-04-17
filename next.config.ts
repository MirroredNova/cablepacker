import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: false,
  },
  experimental: {
    serverMinification: false,
  },
  poweredByHeader: false,
};

export default nextConfig;
