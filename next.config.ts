import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Rewrites allow the Telegram webhook route to be accessed directly
  async rewrites() {
    return [
      {
        source: '/api/telegram/:path*',
        destination: '/api/telegram/:path*',
      },
    ];
  },
};

export default nextConfig;
