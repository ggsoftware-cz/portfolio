import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositoryParts = process.env.GITHUB_REPOSITORY?.split("/") ?? [];
const repositoryName =
  repositoryParts.length === 2 ? repositoryParts[1] : undefined;

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export",
        ...(repositoryName ? { basePath: `/${repositoryName}` } : {}),
      }
    : {}),
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    ...(isGitHubPages ? { unoptimized: true } : {}),
  },
};

export default withNextIntl(nextConfig);
