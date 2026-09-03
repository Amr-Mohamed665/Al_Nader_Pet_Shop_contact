import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'sweetalert2',
      '@fortawesome/fontawesome-free',
      '@reduxjs/toolkit',
      'axios',
    ],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/category/accessories',
        destination: '/accessories',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
