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
  headers: () => Promise.resolve([
    {
      source: '/(.*?)',
      headers: [
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin',
        },
        {
          key: 'Cross-Origin-Resource-Policy',
          value: 'same-origin',
        },
        {
          key: 'Origin-Agent-Cluster',
          value: '?1',
        },
        {
          key: 'Referrer-Policy',
          value: 'no-referrer',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=15552000; includeSubDomains',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'off',
        },
        {
          key: 'X-Download-Options',
          value: 'noopen',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Permitted-Cross-Domain-Policies',
          value: 'none',
        },
        {
          key: 'X-XSS-Protection',
          value: '0',
        },
      ],
    },
  ]),
};

export default nextConfig;
