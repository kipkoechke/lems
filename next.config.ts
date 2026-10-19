import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `standalone` produces the self-contained `.next/standalone` output the
  // minimal Docker production image needs. It is wrong on Vercel: standalone
  // consumes the file-trace manifests, so Vercel's post-build step fails
  // looking for `.next/next-server.js.nft.json`. Vercel traces and bundles the
  // app itself, so there it builds with the default output.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
};

export default nextConfig;
