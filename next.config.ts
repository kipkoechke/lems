import type { NextConfig } from "next";

/** Kept in step with the defaults in `src/lib/axios.ts`. */
const UAT_API_URL = "https://uat.vems.co.ke/api/v1";

const onVercel = Boolean(process.env.VERCEL);

const nextConfig: NextConfig = {
  // `standalone` produces the self-contained `.next/standalone` output the
  // minimal Docker production image needs. It is wrong on Vercel: standalone
  // consumes the file-trace manifests, so Vercel's post-build step fails
  // looking for `.next/next-server.js.nft.json`. Vercel traces and bundles the
  // app itself, so there it builds with the default output.
  ...(onVercel ? {} : { output: "standalone" as const }),

  // Vercel hosts UAT. A Vercel build runs with NODE_ENV=production, so without
  // this it would point at the live API. The choice is made here rather than in
  // axios.ts because that is client code, where Next inlines only NEXT_PUBLIC_*
  // vars — `process.env.VERCEL` reads as undefined in the browser. An explicit
  // NEXT_PUBLIC_API_URL in the Vercel project still wins.
  ...(onVercel && !process.env.NEXT_PUBLIC_API_URL
    ? { env: { NEXT_PUBLIC_API_URL: UAT_API_URL } }
    : {}),
};

export default nextConfig;
