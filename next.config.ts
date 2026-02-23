import type { NextConfig } from "next";

const BACKEND_URL = 'http://171.244.10.135';

const nextConfig: NextConfig = {
  /**
   * Rewrites: proxy /api/proxy/* → VPS backend (server-side)
   * Giải quyết hoàn toàn:
   *  - CORS: request đi từ Next.js server, không phải browser
   *  - Mixed Content: browser chỉ thấy HTTPS Vercel, không thấy HTTP VPS
   */
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
