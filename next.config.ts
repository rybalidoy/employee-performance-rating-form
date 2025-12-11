import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Remove standalone for development - only use for production builds
  // output: "standalone",

  // Use Turbopack (Next.js 16 default) with empty config to silence warning
  // File watching works automatically with Turbopack + Docker volumes
  turbopack: {},
};

export default nextConfig;
