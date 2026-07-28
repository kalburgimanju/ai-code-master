import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.heygen.com' },
      { protocol: 'https', hostname: '**.heygen.ai' },
    ],
  },
  outputFileTracingRoot: process.env.INIT_CWD
    ? undefined
    : process.cwd(),
};

export default nextConfig;
