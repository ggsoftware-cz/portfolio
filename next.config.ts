import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Standalone server build for the Docker/VM deploy: emits `.next/standalone`
  // with a minimal server.js (started via `node server.js`, not `next start`).
  // It's a full Node server, so the next-intl proxy and `/` -> `/cs` redirect
  // keep working in bo. Buth dev and prod.
  output: "standalone",

  // Pin the workspace root so Turbopack doesn't pick the parent lockfile.
  turbopack: {
    root: __dirname,
  },

  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
