import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained output in .next/standalone
  // Required for the minimal Docker production image.
  output: "standalone",

  // ESLint is run separately in CI; skip during `next build`
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
