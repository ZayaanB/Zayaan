import type { NextConfig } from 'next';

// basePath/assetPrefix are required for GitHub Pages project site deployment at /ZayaanBhanwadia.
// Remove both if you ever switch to a custom domain (e.g. zayaanbhanwadia.com).
const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/ZayaanBhanwadia',
  assetPrefix: '/ZayaanBhanwadia/',
  reactStrictMode: false,
  transpilePackages: ['three'],
  images: {
    // Static export requires unoptimized images (Next.js Image Optimization is server-side only)
    unoptimized: true,
  },
};

export default nextConfig;
