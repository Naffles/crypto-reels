/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable iframe embedding
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: `ALLOWALL`
          },
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors ${process.env.NAFFLES_FRONTEND_URL || 'http://localhost:3000'} ${process.env.NAFFLES_ADMIN_URL || 'http://localhost:3001'};`
          }
        ]
      }
    ];
  },

  // API proxy to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3003'}/api/:path*`
      }
    ];
  },

  // Environment variables
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3003',
    NAFFLES_API_URL: process.env.NAFFLES_API_URL || 'http://localhost:3000',
    NAFFLES_FRONTEND_URL: process.env.NAFFLES_FRONTEND_URL || 'http://localhost:3000'
  },

  // Optimize for iframe embedding
  experimental: {
    optimizeCss: true
  }
};

module.exports = nextConfig;