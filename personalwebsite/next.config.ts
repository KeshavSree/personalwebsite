import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /resume.pdf was the resume's URL before it moved to blob storage. Links to it
  // are already out in the world (applications, emails), so send them through the
  // /resume route instead of letting them resolve to a file that goes stale the
  // first time a new PDF is uploaded. beforeFiles so it wins over public/.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/resume.pdf", destination: "/resume" }],
      afterFiles: [],
      fallback: [],
    };
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Performance optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
