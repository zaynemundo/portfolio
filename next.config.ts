import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Inline the (small, Tailwind) CSS into the page, so the first paint
  // doesn't wait for separate stylesheet requests.
  experimental: {
    inlineCss: true,
  },
  images: {
    // 60 for pictures under a dark overlay or behind a video; 75 everywhere else.
    qualities: [60, 75],
    // Keep optimized copies for a month (default 4 hours), so visitors rarely
    // wait for an image to be resized on the spot.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/work",
        destination: "/projects",
      },
      {
        source: "/work/:slug*",
        destination: "/projects/:slug*",
      },
      {
        source: "/insights",
        destination: "/blog",
      },
      {
        source: "/insights/:slug*",
        destination: "/blog/:slug*",
      },
    ];
  },
};

export default nextConfig;
