import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// GitHub automatically sets GITHUB_ACTIONS to "true" in the build runner
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const repositoryParts = process.env.GITHUB_REPOSITORY?.split("/") ?? [];
const repositoryName =
  repositoryParts.length === 2 ? repositoryParts[1] : undefined;

// Determine the correct basePath dynamically
const computedBasePath =
  isGitHubPages && repositoryName ? `/${repositoryName}` : undefined;

const nextConfig: NextConfig = {
  // Set output to export ONLY when building on GitHub Actions
  output: isGitHubPages ? "export" : undefined,

  // Applies the dynamic repo path on GitHub, stays undefined (root) locally
  basePath: computedBasePath,

  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: isGitHubPages,
  },
};

export default withNextIntl(nextConfig);
