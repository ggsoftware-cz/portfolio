import createNextIntlPlugin from 'next-intl/plugin';
import type {NextConfig} from 'next';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: 'export',
        ...(repositoryName ? {basePath: `/${repositoryName}`} : {})
      }
    : {}),
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    ...(isGitHubPages ? {unoptimized: true} : {})
  }
};

export default withNextIntl(nextConfig);
