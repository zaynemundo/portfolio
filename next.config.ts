import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
