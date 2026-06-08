import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Static export only for production builds (GitHub Pages). In dev we must NOT
  // set this, otherwise the next-intl proxy is disabled and `/` can't redirect
  // to `/cs`, which 404s and breaks the root layout.
  output: process.env.NODE_ENV === "production" ? "export" : undefined,

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
